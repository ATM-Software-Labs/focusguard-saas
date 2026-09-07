import { API_BASE } from '../../core/config';
import { showToast } from '../../core/utils';
import { switchView } from '../../core/ui';
import { getAuthToken, getUser, logout, setUser, refreshSessionProfile } from '../auth/auth';
import {
  categories,
  getSelectedBlocklist,
  renderCategories,
  renderCustomPills,
  setCustomDomains,
  syncUserConfigToBackend,
  updateSelectionSummary
} from '../generator/generator';
import type { ExportData } from '../../types';

const APP_FROM_EMAIL = 'alberto@trujillomingorance.com';

const STORAGE_KEYS = {
  PIN: 'focusguard_master_pin',
  NOTIFS: 'focusguard_notification_prefs',
  BILLING_NIF: 'focusguard_billing_nif',
  HW_ID: 'focusguard_hardware_id',
  TOKEN: 'focusguard_user_token',
  DOH: 'focusguard_doh_url',
};

function loadNotifPrefs(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFS) || '{}');
  } catch {
    return {};
  }
}

function saveNotifPrefs(prefs: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(prefs));
}

function setText(id: string, value: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '—';
}

function tierBadgeLabel(tier: string): { label: string; style: string } {
  if (tier === 'enterprise') {
    return {
      label: 'ENTERPRISE ZERO-TRUST',
      style: 'background: rgba(139, 92, 246, 0.18); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.4);',
    };
  }
  if (tier === 'pro') {
    return {
      label: 'PRO ZERO-TRUST ACTIVO',
      style: 'background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35);',
    };
  }
  return {
    label: 'PLAN STARTER (FREE)',
    style: 'background: rgba(148, 163, 184, 0.12); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3);',
  };
}

function detectTimezoneLabel(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const offsetMin = -new Date().getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMin);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return tz ? `${tz} (UTC${sign}${hh}:${mm})` : 'No disponible';
  } catch {
    return 'No disponible';
  }
}

function detectLocaleLabel(): string {
  // Prefer app language setting if present
  const appLang = (localStorage.getItem('focusguard_lang') || document.documentElement.lang || '').toLowerCase();
  const lang = (appLang || navigator.language || '').toLowerCase();
  if (lang.startsWith('es')) return `Español (${lang})`;
  if (lang.startsWith('en')) return `English (${lang}) · cambia el idioma del navegador o de la app`;
  if (lang.startsWith('fr')) return `Français (${lang})`;
  if (lang.startsWith('de')) return `Deutsch (${lang})`;
  return navigator.language || 'No detectado';
}

function applyTierBadge(tier: string) {
  const badge = document.getElementById('settings-tier-badge');
  if (!badge) return;
  const { label, style } = tierBadgeLabel(tier);
  badge.textContent = label;
  badge.setAttribute(
    'style',
    `font-weight: 800; font-size: 0.85rem; padding: 0.5rem 1.1rem; border-radius: 20px; ${style}`
  );
}

function applyDnsFields(token: string, dohUrl?: string) {
  const t = token || localStorage.getItem(STORAGE_KEYS.TOKEN) || '';
  const doh =
    dohUrl ||
    localStorage.getItem(STORAGE_KEYS.DOH) ||
    (t ? `https://focusguard.trujillomingorance.com/dns-query/${t}` : '');

  setText('settings-token-val', t || 'No se pudo generar el token · recarga e inicia sesión');
  setText('settings-doh-val', doh || 'No disponible');

  const filterEl = document.getElementById('settings-filter-status');
  if (filterEl) {
    if (t) {
      filterEl.textContent = 'Activo en Edge (token personal)';
      filterEl.style.color = '#34d399';
    } else {
      filterEl.textContent = 'Pendiente de token';
      filterEl.style.color = 'var(--text-muted)';
    }
  }

  if (t) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, t);
    if (doh) localStorage.setItem(STORAGE_KEYS.DOH, doh);
  }
}

function applyHardware(hwId: string | null | undefined) {
  const id = (hwId || localStorage.getItem(STORAGE_KEYS.HW_ID) || '').trim();
  const hwEl = document.getElementById('settings-hw-id');
  const mdm = document.getElementById('settings-mdm-status');

  if (id) {
    if (hwEl) hwEl.textContent = id;
    if (mdm) {
      mdm.textContent = 'Vinculado · 1 dispositivo';
      mdm.style.color = '#34d399';
    }
    localStorage.setItem(STORAGE_KEYS.HW_ID, id);
  } else {
    if (hwEl) hwEl.textContent = 'Ninguno · pulsa «Vincular este equipo»';
    if (mdm) {
      mdm.textContent = 'Sin dispositivo vinculado';
      mdm.style.color = 'var(--text-muted)';
    }
    localStorage.removeItem(STORAGE_KEYS.HW_ID);
  }
}

async function loadBillingStatus() {
  const token = getAuthToken();
  const user = getUser();
  const planEl = document.getElementById('settings-plan-label');
  const renewEl = document.getElementById('settings-plan-renewal');
  const payEl = document.getElementById('settings-payment-method');
  const noteEl = document.getElementById('settings-billing-note');

  const tier = user?.tier || 'free';
  if (planEl) {
    planEl.textContent =
      tier === 'enterprise'
        ? 'FocusGuard Enterprise (19,99 € / mes valor de catálogo)'
        : tier === 'pro'
          ? 'FocusGuard Pro (4,99 € / mes)'
          : 'Plan gratuito (Starter)';
  }
  if (renewEl) {
    renewEl.textContent =
      tier === 'enterprise'
        ? 'Sin renovación · acceso propietario permanente'
        : tier === 'pro'
          ? 'Pendiente de sincronizar con Stripe'
          : 'Sin ciclo de facturación';
    renewEl.style.color = tier === 'enterprise' ? '#34d399' : 'var(--text-muted)';
  }
  if (payEl) {
    payEl.textContent =
      tier === 'enterprise'
        ? 'Sin tarjeta · plan propietario (no se cobra)'
        : tier === 'pro'
          ? 'Sin tarjeta vinculada en Stripe'
          : 'Sin método de pago';
  }
  if (noteEl) {
    noteEl.textContent =
      'Los emails salen desde ' +
      APP_FROM_EMAIL +
      '. Los campos de pago solo se rellenan si hay cliente Stripe real.';
  }

  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/billing/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();

    if (planEl) {
      const price = data.plan_price && data.plan_price !== '0 €' ? ` (${data.plan_price})` : '';
      planEl.textContent = `${data.plan_label || 'Plan'}${price}`;
    }
    if (renewEl) {
      renewEl.textContent = data.renews_label || data.status_label || 'Sin datos de renovación';
      renewEl.style.color =
        data.status === 'active' || data.status === 'comp_owner' ? '#34d399' : 'var(--text-muted)';
    }
    if (payEl) payEl.textContent = data.payment_method_label || 'Sin método de pago';

    const nifInput = document.getElementById('settings-nif-input') as HTMLInputElement | null;
    if (nifInput && data.tax_id && !nifInput.value) {
      nifInput.value = data.tax_id;
      localStorage.setItem(STORAGE_KEYS.BILLING_NIF, data.tax_id);
    }

    if (noteEl) {
      if (data.status === 'comp_owner' || (data.tier === 'enterprise' && !data.has_stripe)) {
        noteEl.textContent =
          'Plan Enterprise de cuenta propietaria: no hay cobro ni tarjeta en Stripe (normal). Emails desde ' +
          APP_FROM_EMAIL +
          '.';
      } else if (!data.has_stripe) {
        noteEl.textContent =
          'Aún no hay cliente Stripe. Puedes cambiar de plan en Precios. Emails desde ' +
          APP_FROM_EMAIL +
          '.';
      } else {
        noteEl.textContent = `Facturación sincronizada con Stripe. Emails desde ${data.app_from_email || APP_FROM_EMAIL}.`;
      }
    }

    if (data.tier && user && user.tier !== data.tier) {
      user.tier = data.tier;
      setUser(user);
      applyTierBadge(data.tier);
    }
  } catch (e) {
    console.warn('billing status', e);
  }
}

/** Load full account snapshot (tenant, devices, prefs) and fill the UI. */
async function loadAccountSnapshot() {
  const token = getAuthToken();
  if (!token) {
    applyDnsFields('');
    applyHardware('');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      // Fallback to cached token
      applyDnsFields(localStorage.getItem(STORAGE_KEYS.TOKEN) || '');
      applyHardware(localStorage.getItem(STORAGE_KEYS.HW_ID) || '');
      return;
    }

    const data = await res.json();
    const remote = data.user;
    if (remote) {
      const user = getUser() || { name: '', email: '' };
      user.id = remote.id || user.id;
      user.name = remote.name || user.name;
      user.email = remote.email || user.email;
      user.picture = remote.picture || user.picture;
      user.tier = remote.tier || user.tier;
      setUser(user);

      setText('settings-user-name', user.name || '—');
      setText('settings-user-email', user.email || '—');
      applyTierBadge(user.tier || 'free');

      const avatar = document.getElementById('settings-user-avatar') as HTMLImageElement | null;
      if (avatar && user.picture) avatar.src = user.picture;

      const nameInput = document.getElementById('settings-name-input') as HTMLInputElement | null;
      if (nameInput && user.name) nameInput.value = user.name;
    }

    if (data.tenant?.token) {
      applyDnsFields(data.tenant.token, data.tenant.doh_url);
    } else {
      applyDnsFields(localStorage.getItem(STORAGE_KEYS.TOKEN) || '');
    }

    const hw = data.devices?.[0]?.hardware_id || '';
    applyHardware(hw);

    if (data.prefs?.nif) {
      const nifInput = document.getElementById('settings-nif-input') as HTMLInputElement | null;
      if (nifInput) {
        nifInput.value = data.prefs.nif;
        localStorage.setItem(STORAGE_KEYS.BILLING_NIF, data.prefs.nif);
      }
    }

    if (data.prefs?.notifs && typeof data.prefs.notifs === 'object') {
      saveNotifPrefs(data.prefs.notifs);
      const map: Record<string, string> = {
        'notif-nsfw': 'nsfw_alerts',
        'notif-weekly': 'weekly_report',
        'notif-bypass': 'bypass_alerts',
      };
      Object.entries(map).forEach(([elId, key]) => {
        const cb = document.getElementById(elId) as HTMLInputElement | null;
        if (cb && data.prefs.notifs[key] !== undefined) cb.checked = Boolean(data.prefs.notifs[key]);
      });
    }

    const forwardNote = document.getElementById('settings-email-forward-note');
    if (forwardNote) {
      const email = remote?.email || getUser()?.email;
      forwardNote.textContent = email
        ? `OTP, alertas y recibos se envían desde ${APP_FROM_EMAIL} hacia ${email}.`
        : `OTP, alertas y recibos se envían desde ${APP_FROM_EMAIL}.`;
    }
  } catch (e) {
    console.warn('account snapshot', e);
    applyDnsFields(localStorage.getItem(STORAGE_KEYS.TOKEN) || '');
    applyHardware(localStorage.getItem(STORAGE_KEYS.HW_ID) || '');
  }
}

export function openAccountSettings() {
  const user = getUser();

  const settingsAvatar = document.getElementById('settings-user-avatar') as HTMLImageElement | null;
  if (settingsAvatar) {
    settingsAvatar.src = user?.picture || 'https://lh3.googleusercontent.com/a/default-user';
  }
  setText('settings-user-name', user?.name || 'Cargando…');
  setText('settings-user-email', user?.email || 'Cargando…');
  applyTierBadge(user?.tier || 'free');

  // Show cached DNS immediately, then refresh from API
  applyDnsFields(localStorage.getItem(STORAGE_KEYS.TOKEN) || '');
  applyHardware(localStorage.getItem(STORAGE_KEYS.HW_ID) || '');

  const appFrom = document.getElementById('settings-app-from-email');
  if (appFrom) appFrom.textContent = APP_FROM_EMAIL;

  const nameInput = document.getElementById('settings-name-input') as HTMLInputElement | null;
  if (nameInput) nameInput.value = user?.name || '';

  const tzInput = document.getElementById('settings-timezone-input') as HTMLInputElement | null;
  if (tzInput) tzInput.value = detectTimezoneLabel();

  const localeInput = document.getElementById('settings-locale-input') as HTMLInputElement | null;
  if (localeInput) localeInput.value = detectLocaleLabel();

  const notifPrefs = loadNotifPrefs();
  const notifCheckboxes: Record<string, string> = {
    'notif-nsfw': 'nsfw_alerts',
    'notif-weekly': 'weekly_report',
    'notif-bypass': 'bypass_alerts',
  };
  Object.entries(notifCheckboxes).forEach(([elId, key]) => {
    const cb = document.getElementById(elId) as HTMLInputElement | null;
    if (cb) cb.checked = Boolean(notifPrefs[key]);
  });

  const nifInput = document.getElementById('settings-nif-input') as HTMLInputElement | null;
  if (nifInput) {
    nifInput.value = localStorage.getItem(STORAGE_KEYS.BILLING_NIF) || '';
  }

  void loadAccountSnapshot();
  void loadBillingStatus();
  switchView('view-settings');
}

export function initSettings() {
  const userProfile = document.getElementById('user-profile');

  userProfile?.addEventListener('click', (e) => {
    if (
      (e.target as HTMLElement).closest('#logout-btn') ||
      (e.target as HTMLElement).closest('#stripe-upgrade-btn')
    ) {
      return;
    }
    openAccountSettings();
  });

  document.getElementById('btn-save-profile-info')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('settings-name-input') as HTMLInputElement | null;
    if (!nameInput?.value.trim()) {
      showToast('Introduce un nombre válido');
      return;
    }
    const user = getUser();
    if (!user) {
      showToast('Inicia sesión para guardar el perfil');
      return;
    }
    user.name = nameInput.value.trim();
    setUser(user);
    setText('settings-user-name', user.name);

    const nifInput = document.getElementById('settings-nif-input') as HTMLInputElement | null;
    const nif = nifInput?.value.trim() || '';
    if (nif) localStorage.setItem(STORAGE_KEYS.BILLING_NIF, nif);
    else localStorage.removeItem(STORAGE_KEYS.BILLING_NIF);

    const auth = getAuthToken();
    if (auth) {
      try {
        await fetch(`${API_BASE}/api/user/prefs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth}`,
          },
          body: JSON.stringify({ nif }),
        });
      } catch {
        /* local is enough */
      }
    }

    showToast('Datos de perfil guardados');
  });

  document.getElementById('btn-save-notifs')?.addEventListener('click', async () => {
    const prefs: Record<string, boolean> = {};
    const notifCheckboxes: Record<string, string> = {
      'notif-nsfw': 'nsfw_alerts',
      'notif-weekly': 'weekly_report',
      'notif-bypass': 'bypass_alerts',
    };
    Object.entries(notifCheckboxes).forEach(([elId, key]) => {
      const cb = document.getElementById(elId) as HTMLInputElement | null;
      if (cb) prefs[key] = cb.checked;
    });
    saveNotifPrefs(prefs);

    const user = getUser();
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`${API_BASE}/api/user/prefs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prefs }),
        });
      } catch {
        /* ok */
      }
    }
    if (user?.email) {
      try {
        await fetch(`${API_BASE}/api/v1/notification-prefs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ email: user.email, prefs }),
        });
      } catch {
        /* ok */
      }
    }

    showToast('Preferencias de notificaciones guardadas');
  });

  document.getElementById('btn-bind-hardware')?.addEventListener('click', async () => {
    const token = getAuthToken();
    if (!token) {
      showToast('Inicia sesión para vincular hardware');
      return;
    }
    const input = document.getElementById('settings-hw-input') as HTMLInputElement | null;
    const customId = input?.value.trim() || '';

    try {
      showToast('Vinculando dispositivo…');
      const res = await fetch(`${API_BASE}/api/user/device/bind`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          customId
            ? { hardware_id: customId, label: 'Dispositivo principal' }
            : { generate: true, label: 'Dispositivo principal' }
        ),
      });
      const data = await res.json();
      if (res.ok && data.device?.hardware_id) {
        applyHardware(data.device.hardware_id);
        if (input) input.value = '';
        showToast('Hardware vinculado: ' + data.device.hardware_id);
      } else {
        showToast(data.error || 'No se pudo vincular');
      }
    } catch {
      showToast('Error de red al vincular');
    }
  });

  function showOtpPanel(visible: boolean, hint?: string) {
    const panel = document.getElementById('settings-otp-panel');
    const hintEl = document.getElementById('settings-otp-hint');
    if (panel) panel.style.display = visible ? 'block' : 'none';
    if (hintEl && hint) hintEl.textContent = hint;
    if (visible) {
      const input = document.getElementById('settings-otp-input') as HTMLInputElement | null;
      input?.focus();
    }
  }

  document.getElementById('btn-confirm-unlock-otp')?.addEventListener('click', async () => {
    const user = getUser();
    const token = getAuthToken();
    const otpInput = document.getElementById('settings-otp-input') as HTMLInputElement | null;
    const code = (otpInput?.value || '').trim();

    if (!user?.email) {
      showToast('Inicia sesión');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      showToast('Introduce el código de 6 dígitos del email');
      return;
    }

    const hardwareId = document.getElementById('settings-hw-id')?.textContent?.trim() || '';

    try {
      showToast('Verificando OTP…');
      const res = await fetch(`${API_BASE}/api/v1/confirm-unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          otp_code: code,
          parentEmail: user.email,
          hardwareId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'unlocked') {
        applyHardware('');
        if (otpInput) otpInput.value = '';
        showOtpPanel(false);
        showToast('Dispositivo liberado y desvinculado');
      } else {
        showToast(data.error || 'OTP incorrecto o expirado');
      }
    } catch {
      showToast('Error de red al confirmar OTP');
    }
  });

  document.getElementById('btn-stripe-customer-portal')?.addEventListener('click', async () => {
    const token = getAuthToken();
    if (!token) {
      showToast('Inicia sesión para gestionar la facturación');
      return;
    }
    try {
      showToast('Abriendo portal Stripe…');
      const resp = await fetch(`${API_BASE}/api/billing/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.code === 'NO_STRIPE_CUSTOMER') {
        showToast('Sin cliente Stripe (plan propietario). No hay portal de cobro.');
        return;
      }
      showToast(data.error || 'Portal de facturación no disponible');
    } catch {
      showToast('Error de conexión con Stripe');
    }
  });

  document.getElementById('btn-change-plan')?.addEventListener('click', () => {
    switchView('view-pricing');
  });

  document.getElementById('btn-download-last-invoice')?.addEventListener('click', async () => {
    const user = getUser();
    if (!user?.email) {
      showToast('Inicia sesión para recibir el recibo por email');
      return;
    }

    showToast('Enviando desde ' + APP_FROM_EMAIL + '…');
    try {
      const token = getAuthToken();
      const resp = await fetch(`${API_BASE}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          to: user.email,
          subject: 'FocusGuard — Información de facturación',
          text:
            `Hola ${user.name || ''},\n\n` +
            `Remitente: ${APP_FROM_EMAIL}\n` +
            `Plan en cuenta: ${user.tier || 'free'}\n` +
            `Token DNS: ${localStorage.getItem(STORAGE_KEYS.TOKEN) || 'n/d'}\n` +
            `DoH: ${localStorage.getItem(STORAGE_KEYS.DOH) || 'n/d'}\n\n` +
            `Las facturas PDF de Stripe se descargan en el portal de cliente si hay suscripción de pago.\n\n` +
            `FocusGuard`,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.success) {
        showToast(`Email enviado a ${user.email}`);
      } else {
        showToast(data.error || 'No se pudo enviar el email');
      }
    } catch {
      showToast('Error de red al enviar el email');
    }
  });

  document.getElementById('btn-settings-copy-doh')?.addEventListener('click', async () => {
    const settingsDohVal = document.getElementById('settings-doh-val');
    const text = settingsDohVal?.textContent?.trim();
    if (!text || text.startsWith('No ') || text.startsWith('Cargando')) {
      showToast('Aún no hay URL DoH — espera a que cargue el token');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('URL DoH copiada');
    } catch {
      showToast('No se pudo copiar');
    }
  });

  document.getElementById('btn-request-unlock-otp-page')?.addEventListener('click', async () => {
    const user = getUser();
    const token = getAuthToken();
    if (!user?.email) {
      showToast('Inicia sesión para solicitar OTP');
      return;
    }
    const hardwareId = document.getElementById('settings-hw-id')?.textContent?.trim() || '';
    if (!hardwareId || hardwareId.startsWith('Ninguno')) {
      showToast('Vincula un dispositivo antes de solicitar OTP');
      return;
    }

    try {
      showToast(`Enviando OTP desde ${APP_FROM_EMAIL}…`);
      const resp = await fetch(`${API_BASE}/api/v1/request-unlock-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ parentEmail: user.email, hardwareId }),
      });
      const data = await resp.json();
      if (resp.ok && data.status === 'otp_sent') {
        showToast(`OTP enviado a ${user.email}`);
        showOtpPanel(
          true,
          `Código enviado a ${user.email} desde ${APP_FROM_EMAIL}. Válido 10 minutos. Dispositivo: ${hardwareId}`
        );
      } else {
        showToast(data.message || data.error || 'No se pudo enviar el OTP');
      }
    } catch {
      showToast('Error de red al solicitar OTP');
    }
  });

  document.getElementById('btn-settings-save-pin')?.addEventListener('click', () => {
    const pinInput = document.getElementById('settings-pin-input') as HTMLInputElement | null;
    if (pinInput && pinInput.value.length === 4 && /^\d{4}$/.test(pinInput.value)) {
      localStorage.setItem(STORAGE_KEYS.PIN, pinInput.value);
      showToast('PIN maestro guardado');
      pinInput.value = '';
    } else {
      showToast('Introduce un PIN numérico de 4 dígitos');
    }
  });

  document.getElementById('settings-logout-btn')?.addEventListener('click', () => {
    logout();
    switchView('view-overview');
  });

  document.getElementById('btn-clear-cache-page')?.addEventListener('click', () => {
    if (
      confirm(
        'Se eliminarán las reglas personalizadas y la caché local. Esta acción no se puede deshacer.'
      )
    ) {
      setCustomDomains([]);
      renderCustomPills();
      updateSelectionSummary();
      localStorage.removeItem(STORAGE_KEYS.NOTIFS);
      showToast('Caché local eliminada');
    }
  });

  document.getElementById('btn-export-rules-page')?.addEventListener('click', () => {
    const { blocklist, selectedCats } = getSelectedBlocklist();
    const exportData: ExportData = {
      app: 'FocusGuard',
      version: '2.0',
      categories: selectedCats,
      custom_domains: [],
      total_blocked: blocklist.length,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusguard-rules-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Reglas exportadas (.json)');
  });

  const fileImportInput = document.getElementById('file-import-input') as HTMLInputElement | null;
  document.getElementById('btn-import-rules-page')?.addEventListener('click', () => {
    fileImportInput?.click();
  });

  fileImportInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.custom_domains)) {
          setCustomDomains(data.custom_domains);
          renderCustomPills();
        }
        if (Array.isArray(data.categories)) {
          categories.forEach((c) => {
            c.checked = data.categories.includes(c.id);
          });
          renderCategories();
        }
        updateSelectionSummary();
        syncUserConfigToBackend();
        showToast(
          `Reglas importadas: ${data.total_blocked || 0} dominios, ${data.categories?.length || 0} categorías`
        );
      } catch {
        showToast('JSON de reglas no válido');
      }
    };
    reader.readAsText(file);
    fileImportInput.value = '';
  });

  // Warm cache for settings when session exists
  if (getAuthToken()) {
    void refreshSessionProfile();
  }

  initInteractiveSettingsUI();
}

function initInteractiveSettingsUI() {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.settings-tab-btn');
  const panels = document.querySelectorAll<HTMLElement>('.settings-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      if (!targetTab) return;

      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      if (targetTab === 'tab-all') {
        panels.forEach((p) => p.classList.add('active'));
      } else {
        panels.forEach((p) => {
          if (p.id === `panel-${targetTab.replace('tab-', '')}`) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });
      }
    });
  });

  const searchInput = document.getElementById('settings-search-input') as HTMLInputElement | null;
  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
      const activeTab = document.querySelector<HTMLButtonElement>('.settings-tab-btn.active');
      const targetTab = activeTab?.dataset.tab || 'tab-profile';
      if (targetTab === 'tab-all') {
        panels.forEach((p) => p.classList.add('active'));
      } else {
        panels.forEach((p) => {
          p.classList.toggle('active', p.id === `panel-${targetTab.replace('tab-', '')}`);
        });
      }
      return;
    }

    panels.forEach((p) => {
      const keywords = (p.dataset.keywords || '').toLowerCase();
      const content = p.textContent?.toLowerCase() || '';
      const matches = keywords.includes(query) || content.includes(query);
      p.classList.toggle('active', matches);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.settings-info-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.tooltip;
      if (!targetId) return;
      const box = document.getElementById(targetId);
      box?.classList.toggle('active');
    });
  });

  document.getElementById('btn-copy-hw-id')?.addEventListener('click', async () => {
    const hwText = document.getElementById('settings-hw-id')?.textContent?.trim();
    if (!hwText || hwText.startsWith('Ninguno')) {
      showToast('Vincula un dispositivo primero');
      return;
    }
    try {
      await navigator.clipboard.writeText(hwText);
      showToast('ID Hardware copiado');
    } catch {
      showToast('No se pudo copiar');
    }
  });
}

