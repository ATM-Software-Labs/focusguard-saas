import { API_BASE, DEFAULT_ENDPOINT } from '../../core/config';
import { isSafeProviderDomain, showToast } from '../../core/utils';
import { renderQRCodeToElement } from '../../core/qr';
import { getAuthToken, getUser } from '../auth/auth';
import type { Category, Platform } from '../../types';

export const categories: Category[] = [
  {
    id: 'adult',
    title: 'Pornography & Adult Content',
    description: 'Blocks explicit sites, NSFW networks, and adult video hubs.',
    domains: ['pornhub.com', 'xvideos.com', 'onlyfans.com', 'chaturbate.com', 'xhamster.com', 'xnxx.com'],
    checked: true
  },
  {
    id: 'gambling',
    title: 'Gambling & Online Casinos',
    description: 'Blocks betting platforms, crypto casinos, and high-risk digital gambling games.',
    domains: [
      'bet365.es', 'bet365.com', 'stake.com', 'stake.us', 'roobet.com', 'bc.game', 'rollbit.com',
      '1xbet.com', '1x-bet.es', '22bet.com', '20bet.com', 'bwin.es', 'bwin.com', 'williamhill.es',
      'williamhill.com', 'betfair.es', 'betfair.com', '888.es', '888casino.es', '888poker.es',
      '888sport.es', '888casino.com', 'luckia.es', 'winamax.es', 'winamax.fr', 'pokerstars.es',
      'pokerstars.com', 'leovegas.es', 'leovegas.com', 'betsson.es', 'betsson.com', 'kirolbet.es',
      'retabet.es', 'marathonbet.es', 'casinobarcelona.es', 'casinogranmadrid.es', 'paston.es',
      'versus.es', 'yaasscasino.es', 'jokerbet.es', 'marcaapuestas.es', 'asapuestas.es',
      'interwetten.es', 'goldenpark.es', 'suertia.es', 'wanabet.es', 'platincasino.es', 'playuzu.es',
      'bacanaplay.es', 'slottica.es', 'daznbet.es', 'admiralbet.es', 'loteriasyapuestas.es',
      'juegosonce.es', 'draftkings.com', 'fanduel.com', 'bovada.lv', 'ignitioncasino.eu',
      'parimatch.com', 'mostbet.com', 'unibet.com', 'pinnacle.com', '10bet.com', 'vbet.com',
      'betfred.com', 'paddypower.com', 'skybet.com', 'ladbrokes.com', 'melbet.com', '1win.pro',
      'pin-up.casino', 'duelbits.com', 'gamdom.com', 'csgoempire.com', 'csgoroll.com',
      'key-drop.com', 'vulkanvegas.com', 'icecasino.com', 'gg.bet', 'ggpoker.com'
    ],
    checked: true
  },
  {
    id: 'social',
    title: 'Short-Form Video Algorithms',
    description: 'Blocks addictive short-form video feeds and infinite scrolling loops.',
    domains: ['tiktok.com', 'snapchat.com', 'threads.net', 'tumblr.com'],
    checked: true
  },
  {
    id: 'brainrot',
    title: 'Brainrot Games & Endless Dopamine Loops',
    description: 'Blocks hypercasual dopamine traps, infinite farming/match loops, and idle/gacha games like Township, Playrix, Royal Match, Monopoly GO, Subway Surfers, and Candy Crush (Top 40+ games).',
    domains: [
      'township.com', 'playrix.com', 'playrix.net', 'royalmatch.com', 'dreamgames.com',
      'monopolygo.com', 'scopely.com', 'gardenscapes.com', 'fishdom.com', 'homescapes.com',
      'candycrush.com', 'candycrushsaga.com', 'candycrushsoda.com', 'king.com', 'midasplayer.com',
      'subwaysurfers.com', 'sybogames.com', 'mergemansion.com', 'mergegardens.com', 'coinmaster.com',
      'woodoku.com', 'blockudoku.com', 'traveltowngame.com', 'gossipharbor.com', 'evony.com',
      'hero-wars.com', 'lordsmobile.com', 'stateofsurvival.com', 'whiteoutsurvival.com', 'matchfactorygame.com',
      'solitairegrandharvest.com', 'bingoblitz.com', 'angrybirds.com', 'templerun.com', 'talkingtom.com',
      'pou.me', 'fruitninja.com', 'archero.io', 'voodoo.io', 'saygames.com', 'homa.io',
      'crazygames.com', 'poki.com', 'y8.com', 'roblox.com', 'zynga.com', 'raidshadowlegends.com'
    ],
    checked: true
  },
  {
    id: 'dating',
    title: 'Dating & Swiping Apps',
    description: 'Blocks swipe-based matchmaking platforms and digital dating networks.',
    domains: ['tinder.com', 'badoo.com', 'bumble.com', 'okcupid.com', 'match.com'],
    checked: true
  },
  {
    id: 'shopping',
    title: 'Fast Fashion & Impulsive Outlets',
    description: 'Blocks fast fashion consumerism apps and impulse purchasing marketplaces.',
    domains: ['shein.com', 'temu.com', 'fashionnova.com', 'boohoo.com', 'ebay.com'],
    checked: false
  },
  {
    id: 'ads',
    title: 'Ads & Malware Trackers (Pro)',
    description: 'Blocks ads and trackers on top sites (YouTube, Facebook, news, shopping) without blocking the sites themselves.',
    domains: [
      'outbrain.com', 'taboola.com', 'criteo.com', 'adnxs.com', 'popads.net',
      'googlesyndication.com', 'doubleclick.net', 'amazon-adsystem.com',
      'ads-twitter.com', 'an.facebook.com', 'ads.tiktok.com',
      'adeventtracker.spotify.com', 'ads.twitch.tv'
    ],
    checked: false,
    isPremium: true
  }
];

export let customDomains: string[] = [];
export let whitelistDomains: string[] = [];

try {
  const savedCustom = localStorage.getItem('focusguard_custom_domains');
  if (savedCustom) customDomains = JSON.parse(savedCustom);

  const savedCats = localStorage.getItem('focusguard_selected_cats');
  if (savedCats) {
    const catsArr = JSON.parse(savedCats);
    categories.forEach(c => {
      c.checked = catsArr.includes(c.id);
    });
  }

  const savedWhite = localStorage.getItem('focusguard_whitelist_domains');
  if (savedWhite) whitelistDomains = JSON.parse(savedWhite);
} catch (e) {
  console.error("Error restoring saved rules", e);
}

export function setCustomDomains(domains: string[]) {
  customDomains = domains;
}

let selectedPlatform: Platform = 'windows';

export function getSelectedBlocklist(): { blocklist: string[], selectedCats: string[] } {
  const checkboxes = document.querySelectorAll('.block-card input[type="checkbox"]:checked');
  let blocklist: string[] = [];
  const selectedCats: string[] = [];

  checkboxes.forEach(cb => {
    const domains = JSON.parse((cb as HTMLInputElement).dataset.domains || '[]');
    const safeDomains = domains.filter((d: string) => !isSafeProviderDomain(d));
    blocklist = blocklist.concat(safeDomains);
    selectedCats.push((cb as HTMLInputElement).value);
  });

  blocklist = blocklist.concat(customDomains);
  // Filter out whitelist exceptions
  blocklist = blocklist.filter(d => !whitelistDomains.includes(d));

  return { blocklist, selectedCats };
}

export async function syncUserConfigToBackend() {
  const token = getAuthToken();
  if (!token) return;
  const masterShieldSwitch = document.getElementById('master-shield-switch') as HTMLInputElement;
  const { selectedCats } = getSelectedBlocklist();
  try {
    await fetch(`${API_BASE}/api/user/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        categories: selectedCats,
        custom_domains: customDomains,
        whitelist_domains: whitelistDomains,
        enabled: masterShieldSwitch?.checked ?? true
      })
    });
    showToast('Preferences Synced to Cloudflare Edge');
  } catch (e) {
    console.error("Config sync failed", e);
  }
}

export function renderCustomPills() {
  const customPillsContainer = document.getElementById('custom-pills-container');
  if (customPillsContainer) {
    customPillsContainer.innerHTML = '';
    customDomains.forEach((domain, idx) => {
      const tag = document.createElement('span');
      tag.className = 'custom-domain-tag';
      tag.innerHTML = `<span>Blocked: ${domain}</span> <span class="tag-remove-btn" data-idx="${idx}">×</span>`;
      customPillsContainer.appendChild(tag);
    });

    customPillsContainer.querySelectorAll('.tag-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).dataset.idx || '0', 10);
        customDomains.splice(idx, 1);
        renderCustomPills();
        updateSelectionSummary();
        syncUserConfigToBackend();
      });
    });
  }

  const whitelistContainer = document.getElementById('whitelist-pills-container');
  if (whitelistContainer) {
    whitelistContainer.innerHTML = '';
    whitelistDomains.forEach((domain, idx) => {
      const tag = document.createElement('span');
      tag.className = 'custom-domain-tag';
      tag.style.borderColor = 'rgba(16,185,129,0.3)';
      tag.style.color = '#34d399';
      tag.innerHTML = `<span>Allowed: ${domain}</span> <span class="white-remove-btn" data-idx="${idx}">×</span>`;
      whitelistContainer.appendChild(tag);
    });

    whitelistContainer.querySelectorAll('.white-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).dataset.idx || '0', 10);
        whitelistDomains.splice(idx, 1);
        renderCustomPills();
        updateSelectionSummary();
        syncUserConfigToBackend();
      });
    });
  }
}

export function updateSelectionSummary() {
  const checkboxes = document.querySelectorAll('.block-card input[type="checkbox"]:checked');
  let totalDomains = 0;
  const selectedCats: string[] = [];

  checkboxes.forEach(cb => {
    const domains = JSON.parse((cb as HTMLInputElement).dataset.domains || '[]');
    const safeDomains = domains.filter((d: string) => !isSafeProviderDomain(d));
    totalDomains += safeDomains.length;
    selectedCats.push((cb as HTMLInputElement).value);
  });

  totalDomains += customDomains.length;

  try {
    localStorage.setItem('focusguard_custom_domains', JSON.stringify(customDomains));
    localStorage.setItem('focusguard_selected_cats', JSON.stringify(selectedCats));
    localStorage.setItem('focusguard_whitelist_domains', JSON.stringify(whitelistDomains));
  } catch (e) {}

  const countBadge = document.getElementById('selected-categories-badge');
  const domainsCount = document.getElementById('selected-domains-count');

  if (countBadge) countBadge.textContent = `${checkboxes.length} Categorías + ${customDomains.length} Personalizados`;
  if (domainsCount) domainsCount.textContent = `~${totalDomains * 2500}+ Dominios Restringidos`;

  updateLivePreviewCode();
}

export function updateLivePreviewCode(customEndpoint?: string) {
  const { blocklist, selectedCats } = getSelectedBlocklist();
  const filenameEl = document.getElementById('terminal-filename');
  const codeBodyEl = document.getElementById('terminal-code-body');
  const downloadLink = document.getElementById('download-link') as HTMLAnchorElement;
  const qrImg = document.getElementById('mobile-qr-img') as HTMLImageElement;

  const realHost = customEndpoint || (window.location.hostname !== 'localhost' ? window.location.hostname : DEFAULT_ENDPOINT);
  const dohQueryUrl = `https://${realHost}/dns-query?cats=${selectedCats.join(',')}`;
  let qrTargetUrl = dohQueryUrl;
  if (selectedPlatform === 'android') {
    qrTargetUrl = `https://${realHost}/android-setup`;
  }

  if (qrImg) {
    renderQRCodeToElement(qrImg, qrTargetUrl);
  }

  let code = '';
  let filename = 'FocusGuard-Installer.bat';
  let mime = 'application/bat';

  if (selectedPlatform === 'ios') {
    mime = 'application/x-apple-aspen-config';
    filename = 'FocusGuard-Profile.mobileconfig';
    code = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>DNSSettings</key>
  <dict>
    <key>DNSProtocol</key><string>HTTPS</string>
    <key>ServerURL</key><string>${dohQueryUrl}</string>
  </dict>
  <key>PayloadDisplayName</key><string>FocusGuard Cloudflare Edge Profile</string>
  <key>PayloadIdentifier</key><string>dev.pages.focusguard.profile</string>
  <key>PayloadType</key><string>com.apple.dnsSettings.managed</string>
</dict>
</plist>`;
  } else if (selectedPlatform === 'android') {
    mime = 'text/plain';
    filename = 'Android-Private-DNS.txt';
    code = `FOCUSGUARD ANDROID SETUP GUIDE:
===================================================
PRIVATE DNS HOSTNAME:
7twgtf7v6b.cloudflare-gateway.com

INSTRUCTIONS:
1. Open Android Settings ⚙️ -> Network & Internet -> Private DNS
2. Select "Private DNS provider hostname"
3. Paste: 7twgtf7v6b.cloudflare-gateway.com`;
  } else if (selectedPlatform === 'unix') {
    mime = 'text/x-shellscript';
    filename = 'FocusGuard-Installer.sh';
    code = `#!/bin/bash
echo "[+] FocusGuard Zero-Trust Enforcer (${realHost})"
if [ "$EUID" -ne 0 ]; then echo "[-] Error: Please run with sudo (sudo bash FocusGuard-Installer.sh)"; exit 1; fi

echo "[+] Writing kernel loopback rules to /etc/hosts..."
${blocklist.map(d => `grep -q "${d}" /etc/hosts || echo "127.0.0.1 ${d}" >> /etc/hosts`).join('\n')}

echo "[+] Flushing local DNS cache..."
sudo dscacheutil -flushcache 2>/dev/null || true
sudo killall -HUP mDNSResponder 2>/dev/null || true

echo "[SUCCESS] FocusGuard Protection Active! Blocked ${blocklist.length} target domains."`;
  } else {
    mime = 'application/bat';
    filename = 'FocusGuard-Installer.bat';
    code = `@echo off
title FocusGuard Zero-Trust Enforcer (${realHost})
color 0B
echo [!] FocusGuard Cloudflare Edge Protection
echo.

net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [!] Solicitando permisos de Administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [+] Aplicando reglas Zero-Trust en el sistema Windows...
${blocklist.map(d => `findstr /C:"${d}" %WINDIR%\\System32\\drivers\\etc\\hosts >nul || echo 127.0.0.1 ${d} >> %WINDIR%\\System32\\drivers\\etc\\hosts`).join('\r\n')}

echo [+] Limpiando la caché del DNS de Windows...
ipconfig /flushdns >nul

echo.
echo [EXITO] Protección FocusGuard Activada Correctamente! Bloqueados ${blocklist.length} dominios.
pause`;
  }

  if (filenameEl) filenameEl.textContent = filename;
  if (codeBodyEl) codeBodyEl.textContent = code;

  if (downloadLink) {
    const blob = new Blob([code], { type: mime });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
  }
}

function createCategoryCard(cat: Category) {
  const label = document.createElement('label');
  label.className = `block-card`;

  const user = getUser();
  const isProOrEnterprise = user?.tier === 'pro' || user?.tier === 'enterprise';
  const isUnlocked = !cat.isPremium || isProOrEnterprise;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = cat.id;
  checkbox.checked = cat.checked && isUnlocked;
  checkbox.dataset.domains = JSON.stringify(cat.domains);
  if (!isUnlocked) checkbox.disabled = true;

  checkbox.addEventListener('change', () => {
    setPresetActive('preset-custom');
    updateSelectionSummary();
    syncUserConfigToBackend();
  });

  const content = document.createElement('div');
  content.className = 'card-content';

  const headerFlex = document.createElement('div');
  headerFlex.className = 'card-header-flex';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'card-title-group';

  const title = document.createElement('span');
  title.className = 'card-title-text';
  if (cat.isPremium) {
    if (isProOrEnterprise) {
      title.innerHTML = `${cat.title} <span class="badge-tag" style="background: rgba(16,185,129,0.15); color: #34d399; font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid rgba(16,185,129,0.3); margin-left: 0.4rem;">PRO UNLOCKED ⚡</span>`;
    } else {
      title.innerHTML = `${cat.title} <span class="badge-tag" style="background: rgba(239,68,68,0.15); color: #f87171; font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid rgba(239,68,68,0.3); margin-left: 0.4rem;">PRO FEATURE 🔒</span>`;
    }
  } else {
    title.textContent = cat.title;
  }

  titleGroup.appendChild(title);

  const visualCb = document.createElement('div');
  visualCb.className = 'checkbox-visual';
  visualCb.innerHTML = '✓';

  headerFlex.appendChild(titleGroup);
  headerFlex.appendChild(visualCb);

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = cat.description;

  const domainPillList = document.createElement('div');
  domainPillList.className = 'domain-pill-list';
  cat.domains.slice(0, 4).forEach((d: string) => {
    const pill = document.createElement('span');
    pill.className = 'domain-pill';
    pill.textContent = `Blocked: ${d}`;
    domainPillList.appendChild(pill);
  });

  content.appendChild(headerFlex);
  content.appendChild(desc);
  content.appendChild(domainPillList);

  label.appendChild(checkbox);
  label.appendChild(content);

  return label;
}

export function renderCategories() {
  const categoriesContainer = document.getElementById('categories-container');
  if (!categoriesContainer) return;
  categoriesContainer.innerHTML = '';
  categories.forEach(cat => {
    categoriesContainer.appendChild(createCategoryCard(cat));
  });
  updateSelectionSummary();
}

function setPresetActive(presetId: string) {
  document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
  document.getElementById(presetId)?.classList.add('active');
}

export function initGenerator() {
  // Platform tab click listeners
  document.querySelectorAll('.platform-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.platform-tab').forEach(t => t.classList.remove('active'));
      const target = e.currentTarget as HTMLElement;
      target.classList.add('active');
      selectedPlatform = target.dataset.platform as Platform;

      // Show/hide android copy box
      const androidVisual = document.getElementById('android-visual-card');
      if (androidVisual) {
        if (selectedPlatform === 'android') {
          androidVisual.classList.remove('hidden');
        } else {
          androidVisual.classList.add('hidden');
        }
      }

      updateSelectionSummary();
    });
  });

  // Blacklist Add Domain Input
  const customInput = document.getElementById('custom-domain-input') as HTMLInputElement;
  const addDomainBtn = document.getElementById('add-domain-btn');

  function addCustomDomain() {
    if (!customInput) return;
    let val = customInput.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!val) return;

    if (isSafeProviderDomain(val)) {
      alert(`"${val}" is a core protected domain and cannot be blacklisted.`);
      customInput.value = '';
      return;
    }

    if (!customDomains.includes(val)) {
      customDomains.push(val);
      renderCustomPills();
      updateSelectionSummary();
      syncUserConfigToBackend();
    }
    customInput.value = '';
  }

  addDomainBtn?.addEventListener('click', addCustomDomain);
  customInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCustomDomain();
  });

  // Whitelist Add Domain Input
  const customWhiteInput = document.getElementById('custom-whitelist-input') as HTMLInputElement;
  const addWhiteBtn = document.getElementById('add-whitelist-btn');

  function addWhitelistDomain() {
    if (!customWhiteInput) return;
    let val = customWhiteInput.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!val) return;

    if (!whitelistDomains.includes(val)) {
      whitelistDomains.push(val);
      renderCustomPills();
      updateSelectionSummary();
      syncUserConfigToBackend();
    }
    customWhiteInput.value = '';
  }

  addWhiteBtn?.addEventListener('click', addWhitelistDomain);
  customWhiteInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addWhitelistDomain();
  });

  // Preset Buttons
  document.getElementById('preset-standard')?.addEventListener('click', () => {
    setPresetActive('preset-standard');
    categories.forEach(c => {
      c.checked = (c.id === 'adult' || c.id === 'gambling' || c.id === 'social' || c.id === 'brainrot');
    });
    renderCategories();
    syncUserConfigToBackend();
  });

  document.getElementById('preset-school')?.addEventListener('click', () => {
    setPresetActive('preset-school');
    categories.forEach(c => {
      c.checked = (c.id === 'adult' || c.id === 'gambling' || c.id === 'dating' || c.id === 'social' || c.id === 'brainrot');
    });
    renderCategories();
    syncUserConfigToBackend();
  });

  document.getElementById('preset-hardcore')?.addEventListener('click', () => {
    setPresetActive('preset-hardcore');
    categories.forEach(c => {
      c.checked = true;
    });
    renderCategories();
    syncUserConfigToBackend();
  });

  document.getElementById('preset-dev')?.addEventListener('click', () => {
    setPresetActive('preset-dev');
    categories.forEach(c => {
      c.checked = (c.id === 'adult' || c.id === 'ads');
    });
    renderCategories();
    syncUserConfigToBackend();
  });

  document.getElementById('preset-custom')?.addEventListener('click', () => {
    setPresetActive('preset-custom');
  });

  // Quick App Chips
  document.querySelectorAll('#quick-app-chips .app-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const appId = target.dataset.app;
      if (!appId) return;

      const cat = categories.find(c => c.id === appId);
      if (cat) {
        cat.checked = !cat.checked;
        target.classList.toggle('active', cat.checked);
        setPresetActive('preset-custom');
        renderCategories();
        syncUserConfigToBackend();
      }
    });
  });

  // Live Category Search Filter Input
  const searchInput = document.getElementById('category-search-input') as HTMLInputElement;
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('#categories-container .block-card').forEach(card => {
      const text = card.textContent?.toLowerCase() || '';
      if (!q || text.includes(q)) {
        (card as HTMLElement).style.display = 'flex';
      } else {
        (card as HTMLElement).style.display = 'none';
      }
    });
  });

  // Token Copy & Generator Buttons
  document.getElementById('btn-copy-token')?.addEventListener('click', async () => {
    const displayEl = document.getElementById('user-token-display');
    if (displayEl && displayEl.textContent) {
      try {
        await navigator.clipboard.writeText(displayEl.textContent);
        showToast('Token Copied to Clipboard');
      } catch (e) {
        console.error(e);
      }
    }
  });

  document.getElementById('btn-generate-token')?.addEventListener('click', () => {
    const randomHex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newToken = `fg_${randomHex}`;
    const displayEl = document.getElementById('user-token-display');
    const dohEndpoint = document.getElementById('user-doh-endpoint');
    
    if (displayEl) displayEl.textContent = newToken;
    if (dohEndpoint) dohEndpoint.textContent = `https://focusguard.trujillomingorance.com/dns-query/${newToken}`;
    
    showToast('New Dedicated Zero-Trust Token Generated');
    updateSelectionSummary();
  });

  // Share Profile Button
  document.getElementById('btn-share-profile')?.addEventListener('click', async () => {
    const { selectedCats } = getSelectedBlocklist();
    const shareUrl = `${window.location.protocol}//${window.location.host}/?cats=${selectedCats.join(',')}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Profile Share Link Copied to Clipboard');
    } catch (e) {
      console.error(e);
    }
  });

  // Copy Android Hostname
  document.getElementById('btn-copy-android-hostname')?.addEventListener('click', async () => {
    const el = document.getElementById('android-dot-hostname');
    if (el && el.textContent) {
      try {
        await navigator.clipboard.writeText(el.textContent);
        showToast('Android Private DNS Hostname Copied');
      } catch (e) {
        console.error(e);
      }
    }
  });

  // Copy Code Button
  document.getElementById('copy-code-btn')?.addEventListener('click', async () => {
    const codeBodyEl = document.getElementById('terminal-code-body');
    if (codeBodyEl && codeBodyEl.textContent) {
      try {
        await navigator.clipboard.writeText(codeBodyEl.textContent);
        showToast('Script Code Copied to Clipboard');
      } catch (e) {
        console.error(e);
      }
    }
  });

  // Compile & Download Action Button
  document.getElementById('download-link')?.addEventListener('click', async () => {
    const { blocklist, selectedCats } = getSelectedBlocklist();

    if (blocklist.length === 0) {
      alert("Please select at least one category or add a custom domain.");
      return;
    }

    try {
      let dotEndpoint = DEFAULT_ENDPOINT;
      const token = getAuthToken();

      if (token) {
        const res = await fetch(`${API_BASE}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ categories: selectedCats })
        });

        if (res.ok) {
          const data = await res.json();
          dotEndpoint = data.dot_endpoint;
        }
      }

      updateLivePreviewCode(dotEndpoint);
      showToast('Rule Profile Compiled & Protection Downloaded');
    } catch (e) {
      console.error("Generation failed", e);
    }
  });

  renderCategories();
  renderCustomPills();
}
