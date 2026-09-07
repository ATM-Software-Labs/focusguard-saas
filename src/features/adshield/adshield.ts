import { API_BASE } from '../../core/config';
import { showToast } from '../../core/utils';
import { switchView } from '../../core/ui';
import { buildShieldPackage, downloadTextFile } from './packages';
import type { User } from '../../types';

const ENTERPRISE_GUIDES = new Set(['ad-ldap', 'mdm', 'firewall']);

/** Read cached user without importing auth (avoids circular dependency). */
function getCachedUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function isEnterpriseUser(): boolean {
  return (getCachedUser()?.tier || 'free') === 'enterprise';
}

/** Unlock AD/LDAP, Intune/MDM and Firewall guides when the account is Enterprise. */
export function updateEnterpriseGuidesUI(userTier: 'free' | 'pro' | 'enterprise' = 'free') {
  const isEnterprise = userTier === 'enterprise';

  document.querySelectorAll('.enterprise-locked-card, .enterprise-guide-card').forEach((card) => {
    const el = card as HTMLElement;
    const guide = el.dataset.guide || '';
    const badge = el.querySelector('.enterprise-lock-badge') as HTMLElement | null;
    const btn = el.querySelector('.btn-enterprise-locked, .btn-open-guide[data-enterprise-guide]') as HTMLButtonElement | null;

    if (isEnterprise) {
      el.classList.remove('enterprise-locked-card');
      el.classList.add('enterprise-guide-card');
      el.style.opacity = '1';
      el.style.cursor = 'pointer';
      el.style.borderColor = 'rgba(139, 92, 246, 0.45)';
      el.style.boxShadow = '0 0 0 1px rgba(139, 92, 246, 0.15)';

      if (badge) {
        badge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span style="font-size: 0.68rem; font-weight: 700; color: #a78bfa;">ENTERPRISE</span>`;
        badge.style.background = 'rgba(139, 92, 246, 0.15)';
        badge.style.borderColor = 'rgba(139, 92, 246, 0.4)';
      }

      if (btn) {
        btn.classList.remove('btn-enterprise-locked');
        btn.classList.add('btn-open-guide');
        btn.dataset.guide = guide;
        btn.dataset.enterpriseGuide = '1';
        btn.textContent = 'Ver Guía →';
        btn.onclick = null;
        btn.removeAttribute('onclick');
      }
    } else {
      el.classList.add('enterprise-locked-card');
      el.classList.remove('enterprise-guide-card');
      el.style.opacity = '0.65';
      el.style.cursor = 'pointer';
      el.style.borderColor = '';
      el.style.boxShadow = '';

      if (badge) {
        badge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted);">ENTERPRISE</span>`;
        badge.style.background = '';
        badge.style.borderColor = '';
      }

      if (btn) {
        btn.classList.add('btn-enterprise-locked');
        btn.classList.remove('btn-open-guide');
        delete btn.dataset.guide;
        delete btn.dataset.enterpriseGuide;
        btn.textContent = 'Requiere Plan Enterprise';
        btn.onclick = null;
        btn.removeAttribute('onclick');
      }
    }
  });
}

function goToPricing() {
  switchView('view-pricing');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const PROFILE_KEY = 'focusguard_adshield_profile';

function getAdshieldProfileId(): string {
  let id = localStorage.getItem(PROFILE_KEY) || '';
  if (!/^[a-z0-9]{8,24}$/i.test(id)) {
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    id = Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').replace(/[^a-z0-9]/gi, '').slice(0, 16);
    localStorage.setItem(PROFILE_KEY, id);
  }
  return id.toLowerCase();
}

function getAdshieldSelectedCats(): string[] {
  const selected = new Set(
    Array.from(document.querySelectorAll('[id^="adshield-cat-"]:checked'))
      .map((el) => el.id.replace('adshield-cat-', ''))
  );
  document.querySelectorAll('.block-card input[type="checkbox"]:checked').forEach((el) => {
    const value = (el as HTMLInputElement).value;
    if (value) selected.add(value);
  });
  const adsBox = document.getElementById('adshield-cat-ads') as HTMLInputElement | null;
  if (adsBox && !adsBox.checked && !selected.has('noads') && !selected.has('ads')) {
    selected.add('noads');
  }
  return Array.from(selected);
}

function getAdshieldEndpoint(): string {
  return `p_${getAdshieldProfileId()}`;
}

function refreshAdshieldDohLabels() {
  const dohUrl = `https://focusguard.trujillomingorance.com/dns-query/${getAdshieldEndpoint()}`;
  document.querySelectorAll(
    '#android-guide-doh-repeated, #ios-guide-doh, #win-guide-doh, #browser-guide-doh, #router-guide-doh, #firewall-guide-doh'
  ).forEach((el) => {
    el.textContent = dohUrl;
  });
  const live = document.getElementById('adshield-live-url');
  if (live) live.textContent = dohUrl;
}

let adshieldBlacklist: string[] = [];
let adshieldWhitelist: string[] = [];

function sanitizeDomainInput(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
}

function renderAdshieldCustomPills() {
  const blContainer = document.getElementById('adshield-blacklist-pills');
  if (blContainer) {
    if (adshieldBlacklist.length === 0) {
      blContainer.innerHTML = `<span style="font-size: 0.78rem; color: var(--text-muted); font-style: italic;">Sin dominios en la lista negra</span>`;
    } else {
      blContainer.innerHTML = adshieldBlacklist.map(d => `
        <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.35rem;">
          ${d}
          <button type="button" class="btn-del-bl" data-domain="${d}" style="background: none; border: none; color: #f87171; cursor: pointer; font-size: 0.85rem; font-weight: 800; padding: 0;">×</button>
        </span>
      `).join('');
      blContainer.querySelectorAll('.btn-del-bl').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const domain = (e.currentTarget as HTMLElement).dataset.domain;
          if (domain) {
            adshieldBlacklist = adshieldBlacklist.filter(item => item !== domain);
            renderAdshieldCustomPills();
            void syncAdshieldProfile();
            showToast(`Dominio ${domain} eliminado de la lista negra`);
          }
        });
      });
    }
  }

  const wlContainer = document.getElementById('adshield-whitelist-pills');
  if (wlContainer) {
    if (adshieldWhitelist.length === 0) {
      wlContainer.innerHTML = `<span style="font-size: 0.78rem; color: var(--text-muted); font-style: italic;">Sin excepciones en la lista blanca</span>`;
    } else {
      wlContainer.innerHTML = adshieldWhitelist.map(d => `
        <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.35rem;">
          ${d}
          <button type="button" class="btn-del-wl" data-domain="${d}" style="background: none; border: none; color: #34d399; cursor: pointer; font-size: 0.85rem; font-weight: 800; padding: 0;">×</button>
        </span>
      `).join('');
      wlContainer.querySelectorAll('.btn-del-wl').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const domain = (e.currentTarget as HTMLElement).dataset.domain;
          if (domain) {
            adshieldWhitelist = adshieldWhitelist.filter(item => item !== domain);
            renderAdshieldCustomPills();
            void syncAdshieldProfile();
            showToast(`Excepción ${domain} eliminada de la lista blanca`);
          }
        });
      });
    }
  }
}

async function syncAdshieldProfile() {
  const categories = getAdshieldSelectedCats();
  try {
    localStorage.setItem('focusguard_adshield_categories', JSON.stringify(categories));
    localStorage.setItem('focusguard_adshield_blacklist', JSON.stringify(adshieldBlacklist));
    localStorage.setItem('focusguard_adshield_whitelist', JSON.stringify(adshieldWhitelist));
    await fetch(`${API_BASE}/api/adshield/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: getAdshieldProfileId(),
        categories,
        blacklist: adshieldBlacklist,
        whitelist: adshieldWhitelist
      }),
    });
  } catch {
    /* offline: DoH still uses last saved profile */
  }
}

async function loadAdshieldProfile() {
  try {
    const profileId = getAdshieldProfileId();
    let categories: string[] = [];

    const cachedCats = localStorage.getItem('focusguard_adshield_categories');
    if (cachedCats) categories = JSON.parse(cachedCats);

    const cachedBl = localStorage.getItem('focusguard_adshield_blacklist');
    if (cachedBl) adshieldBlacklist = JSON.parse(cachedBl);

    const cachedWl = localStorage.getItem('focusguard_adshield_whitelist');
    if (cachedWl) adshieldWhitelist = JSON.parse(cachedWl);

    const res = await fetch(`${API_BASE}/api/adshield/profile?id=${profileId}`);
    if (res.ok) {
      const data = await res.json() as { categories?: string[]; blacklist?: string[]; whitelist?: string[] };
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        categories = data.categories;
        localStorage.setItem('focusguard_adshield_categories', JSON.stringify(categories));
      }
      if (Array.isArray(data.blacklist)) {
        adshieldBlacklist = data.blacklist;
        localStorage.setItem('focusguard_adshield_blacklist', JSON.stringify(adshieldBlacklist));
      }
      if (Array.isArray(data.whitelist)) {
        adshieldWhitelist = data.whitelist;
        localStorage.setItem('focusguard_adshield_whitelist', JSON.stringify(adshieldWhitelist));
      }
    }

    renderAdshieldCustomPills();

    if (categories.length > 0) {
      document.querySelectorAll<HTMLInputElement>('[id^="adshield-cat-"]').forEach((cb) => {
        const catName = cb.id.replace('adshield-cat-', '');
        if (catName === 'ads') {
          cb.checked = !categories.includes('noads') && (categories.includes('ads') || categories.length > 0);
        } else {
          cb.checked = categories.includes(catName);
        }
      });
    }
  } catch {
    /* offline fallback */
  }
}

async function downloadFleetDeploy(platform: 'windows' | 'ios' | 'mac') {
  const user = getCachedUser();
  const orgName = user?.name ? `${user.name} Org` : 'Empresa Corporativa';

  const tenantId = getAdshieldEndpoint();

  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/fleet/deploy`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ platform, tenant_id: tenantId, org_name: orgName })
    });

    if (res.status === 403) {
      showToast('🔒 Se requiere Plan Enterprise para descargas de flota');
      goToPricing();
      return;
    }

    if (!res.ok) {
      showToast('⚠️ Error al generar el paquete de despliegue');
      return;
    }

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1]
      || (platform === 'windows'
        ? 'FocusGuard-Fleet-Deploy.ps1'
        : 'FocusGuard-Fleet.mobileconfig');

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Paquete Enterprise descargado');
  } catch (err) {
    console.error('Fleet deploy failed', err);
    showToast('⚠️ No se pudo conectar con el generador de flota');
  }
}

export function initAdShield() {
  // Apply enterprise unlock state on load (auth may already be cached)
  updateEnterpriseGuidesUI((getCachedUser()?.tier || 'free') as 'free' | 'pro' | 'enterprise');
  refreshAdshieldDohLabels();
  void loadAdshieldProfile().then(() => {
    refreshAdshieldDohLabels();
    void syncAdshieldProfile();
  });

  // Device Guides Toggle "Mostrar más guías"
  const toggleGuidesBtn = document.getElementById('btn-toggle-more-guides');
  const moreGuidesContainer = document.getElementById('more-guides-container');

  toggleGuidesBtn?.addEventListener('click', () => {
    if (!moreGuidesContainer) return;
    const isHidden = moreGuidesContainer.classList.contains('hidden');
    if (isHidden) {
      moreGuidesContainer.classList.remove('hidden');
      toggleGuidesBtn.textContent = 'Ocultar guías adicionales ↑';
    } else {
      moreGuidesContainer.classList.add('hidden');
      toggleGuidesBtn.textContent = 'Mostrar más guías (+ Router, Mac, Navegador) ↓';
    }
  });

  // Device Guide Search Handler
  const guideSearchInput = document.getElementById('device-guide-search') as HTMLInputElement | null;
  guideSearchInput?.addEventListener('input', () => {
    const query = guideSearchInput.value.toLowerCase().trim();
    if (query && moreGuidesContainer) {
      moreGuidesContainer.classList.remove('hidden');
      if (toggleGuidesBtn) toggleGuidesBtn.textContent = 'Ocultar guías adicionales ↑';
    }
    document.querySelectorAll('.device-guide-card').forEach((card) => {
      const el = card as HTMLElement;
      const text = el.textContent?.toLowerCase() || '';
      if (!query || text.includes(query)) {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
  });

  // AdShield Device Guides Navigation
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Pricing redirect for locked enterprise buttons / cards
    if (target.closest('.btn-enterprise-locked') || target.closest('.enterprise-locked-card')) {
      e.preventDefault();
      e.stopPropagation();
      showToast('🔒 Esta guía requiere Plan Enterprise');
      goToPricing();
      return;
    }

    const guideBtn = target.closest('.btn-open-guide') as HTMLElement;
    const guideCard = target.closest('.device-guide-card') as HTMLElement;
    const guideElement = guideBtn || guideCard;

    if (!guideElement?.dataset.guide) return;

    const guide = guideElement.dataset.guide;

    // Block enterprise guides for non-enterprise accounts
    if (ENTERPRISE_GUIDES.has(guide) && !isEnterpriseUser()) {
      e.preventDefault();
      e.stopPropagation();
      showToast('🔒 Esta guía requiere Plan Enterprise');
      goToPricing();
      return;
    }

    switchView('view-adshield-' + guide);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // AdShield Back Button Handler
  document.querySelectorAll('.btn-back-adshield').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('view-adshield');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Enterprise fleet deploy download buttons
  document.querySelectorAll('.btn-fleet-deploy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isEnterpriseUser()) {
        showToast('🔒 Requiere Plan Enterprise');
        goToPricing();
        return;
      }
      const platform = (btn as HTMLElement).dataset.platform as 'windows' | 'ios' | 'mac';
      if (platform) downloadFleetDeploy(platform);
    });
  });

  // Blacklist & Whitelist Add Handlers
  const blInput = document.getElementById('adshield-blacklist-input') as HTMLInputElement | null;
  const addBlBtn = document.getElementById('adshield-add-blacklist-btn');
  const addBlacklistDomain = () => {
    if (!blInput) return;
    const domain = sanitizeDomainInput(blInput.value);
    if (!domain || domain.length < 3) return;
    if (!adshieldBlacklist.includes(domain)) {
      adshieldBlacklist.push(domain);
      // Remove from whitelist if present
      adshieldWhitelist = adshieldWhitelist.filter(d => d !== domain);
      renderAdshieldCustomPills();
      void syncAdshieldProfile();
      showToast(`Dominio ${domain} añadido a la Lista Negra`);
    }
    blInput.value = '';
  };
  addBlBtn?.addEventListener('click', addBlacklistDomain);
  blInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addBlacklistDomain();
  });

  const wlInput = document.getElementById('adshield-whitelist-input') as HTMLInputElement | null;
  const addWlBtn = document.getElementById('adshield-add-whitelist-btn');
  const addWhitelistDomain = () => {
    if (!wlInput) return;
    const domain = sanitizeDomainInput(wlInput.value);
    if (!domain || domain.length < 3) return;
    if (!adshieldWhitelist.includes(domain)) {
      adshieldWhitelist.push(domain);
      // Remove from blacklist if present
      adshieldBlacklist = adshieldBlacklist.filter(d => d !== domain);
      renderAdshieldCustomPills();
      void syncAdshieldProfile();
      showToast(`Excepción ${domain} añadida a la Lista Blanca`);
    }
    wlInput.value = '';
  };
  addWlBtn?.addEventListener('click', addWhitelistDomain);
  wlInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addWhitelistDomain();
  });

  // AdShield Checkboxes Handler
  const persistProfile = () => {
    refreshAdshieldDohLabels();
    void syncAdshieldProfile();
    showToast('Perfil actualizado — Brave y Windows ya usan este bloqueo');
  };
  document.addEventListener('change', (e) => {
    const t = e.target as HTMLElement | null;
    if (!t) return;
    if (t.matches('[id^="adshield-cat-"]') || t.matches('.block-card input[type="checkbox"]')) {
      persistProfile();
    }
  });

  // AdShield Copy DoH Button Handler
  document.querySelector('.btn-copy-master-endpoint')?.addEventListener('click', async () => {
    const url = `https://focusguard.trujillomingorance.com/dns-query/${getAdshieldEndpoint()}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Endpoint Copiado al Portapapeles');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  });

  // Android DoT Copy Button Handler
  document.getElementById('btn-copy-android-dot')?.addEventListener('click', async () => {
    const dotHost = document.getElementById('android-guide-dot-hostname')?.textContent || '7twgtf7v6b.cloudflare-gateway.com';
    try {
      await navigator.clipboard.writeText(dotHost);
      showToast('Hostname DNS Privado Copiado al Portapapeles');
    } catch (err) {
      console.error(err);
    }
  });

  // Android DoH Copy Button Handler
  document.getElementById('btn-copy-android-doh')?.addEventListener('click', async () => {
    const dohUrl = `https://focusguard.trujillomingorance.com/dns-query/${getAdshieldEndpoint()}`;
    try {
      await navigator.clipboard.writeText(dohUrl);
      showToast('URL DoH Copiada al Portapapeles');
    } catch (err) {
      console.error(err);
    }
  });

  // iOS DoH Copy Button Handler
  document.getElementById('btn-copy-ios-doh')?.addEventListener('click', async () => {
    const dohUrl = `https://focusguard.trujillomingorance.com/dns-query/${getAdshieldEndpoint()}`;
    try {
      await navigator.clipboard.writeText(dohUrl);
      showToast('URL DoH Copiada al Portapapeles');
    } catch (err) {
      console.error(err);
    }
  });

  // Browser DoH Copy Button Handler
  document.getElementById('btn-copy-browser-doh')?.addEventListener('click', async () => {
    const url = `https://focusguard.trujillomingorance.com/dns-query/${getAdshieldEndpoint()}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('URL DoH Copiada al Portapapeles');
    } catch (err) {
      console.error(err);
    }
  });

  document.querySelectorAll('.btn-script-action').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const platform = target.dataset.platform || '';
      const action = (target.dataset.action === 'disable' ? 'disable' : 'enable') as 'enable' | 'disable';
      await syncAdshieldProfile();
      const dohUrl = `https://focusguard.trujillomingorance.com/dns-query/${getAdshieldEndpoint()}`;
      const pkg = buildShieldPackage(platform, action, dohUrl);
      if (!pkg) {
        showToast('No hay paquete para esta plataforma');
        return;
      }
      downloadTextFile(pkg);
      showToast(action === 'enable' ? 'Archivo de instalación descargado' : 'Archivo de desinstalación descargado');
    });
  });
}
