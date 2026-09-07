/**
 * FocusGuard Core UI & Navigation System
 */

import { applyTranslations } from './i18n';

const VIEW_TO_PATH: Record<string, string> = {
  'view-overview': '/',
  'view-configurator': '/configurador',
  'view-pricing': '/precios',
  'view-adshield': '/adshield',
  'view-adshield-android': '/adshield/android',
  'view-adshield-ios': '/adshield/ios',
  'view-adshield-windows': '/adshield/windows',
  'view-adshield-mac': '/adshield/mac',
  'view-adshield-router': '/adshield/router',
  'view-adshield-browser': '/adshield/browser',
  'view-adshield-ad-ldap': '/adshield/ad-ldap',
  'view-adshield-mdm': '/adshield/mdm',
  'view-adshield-firewall': '/adshield/firewall',
  'view-advanced': '/avanzado',
  'view-settings': '/ajustes',
  'view-mobile-install': '/instalar',
  'view-terms': '/terminos',
  'view-privacy': '/privacidad',
  'view-cookies': '/cookies',
  'view-refund': '/reembolso',
  'view-notice': '/aviso',
  'view-login': '/login',
  'view-signup': '/signup',
};

const PATH_TO_VIEW: Record<string, string> = {
  '/': 'view-overview',
  '/inicio': 'view-overview',
  '/panel': 'view-overview',
  '/configurador': 'view-configurator',
  '/config': 'view-configurator',
  '/precios': 'view-pricing',
  '/pricing': 'view-pricing',
  '/adshield': 'view-adshield',
  '/ad-shield': 'view-adshield',
  '/adshield/android': 'view-adshield-android',
  '/adshield/ios': 'view-adshield-ios',
  '/adshield/iphone': 'view-adshield-ios',
  '/adshield/windows': 'view-adshield-windows',
  '/adshield/mac': 'view-adshield-mac',
  '/adshield/macos': 'view-adshield-mac',
  '/adshield/linux': 'view-adshield-mac',
  '/adshield/router': 'view-adshield-router',
  '/adshield/browser': 'view-adshield-browser',
  '/adshield/navegador': 'view-adshield-browser',
  '/adshield/ad-ldap': 'view-adshield-ad-ldap',
  '/adshield/ldap': 'view-adshield-ad-ldap',
  '/adshield/mdm': 'view-adshield-mdm',
  '/adshield/intune': 'view-adshield-mdm',
  '/adshield/firewall': 'view-adshield-firewall',
  '/avanzado': 'view-advanced',
  '/advanced': 'view-advanced',
  '/ajustes': 'view-settings',
  '/settings': 'view-settings',
  '/instalar': 'view-mobile-install',
  '/terminos': 'view-terms',
  '/terms': 'view-terms',
  '/privacidad': 'view-privacy',
  '/privacy': 'view-privacy',
  '/cookies': 'view-cookies',
  '/reembolso': 'view-refund',
  '/aviso': 'view-notice',
  '/login': 'view-login',
  '/iniciar-sesion': 'view-login',
  '/signup': 'view-signup',
  '/registrarse': 'view-signup',
  '/crear-cuenta': 'view-signup',
};

const VIEW_TITLES: Record<string, string> = {
  'view-overview': 'FocusGuard',
  'view-configurator': 'Configurador · FocusGuard',
  'view-pricing': 'Precios · FocusGuard',
  'view-adshield': 'AdShield · FocusGuard',
  'view-adshield-android': 'AdShield Android · FocusGuard',
  'view-adshield-ios': 'AdShield iPhone / iPad · FocusGuard',
  'view-adshield-windows': 'AdShield Windows · FocusGuard',
  'view-adshield-mac': 'AdShield macOS / Linux · FocusGuard',
  'view-adshield-router': 'AdShield Router · FocusGuard',
  'view-adshield-browser': 'AdShield Navegador · FocusGuard',
  'view-adshield-ad-ldap': 'AdShield Active Directory · FocusGuard',
  'view-adshield-mdm': 'AdShield Intune / MDM · FocusGuard',
  'view-adshield-firewall': 'AdShield Firewall · FocusGuard',
  'view-advanced': 'Herramientas avanzadas · FocusGuard',
  'view-settings': 'Ajustes · FocusGuard',
  'view-mobile-install': 'Instalar · FocusGuard',
  'view-terms': 'Términos · FocusGuard',
  'view-privacy': 'Privacidad · FocusGuard',
  'view-cookies': 'Cookies · FocusGuard',
  'view-refund': 'Reembolso · FocusGuard',
  'view-notice': 'Aviso legal · FocusGuard',
  'view-login': 'Iniciar Sesión · FocusGuard',
  'view-signup': 'Crear Cuenta · FocusGuard',
};

function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export function viewFromLocation(): string {
  const params = new URLSearchParams(window.location.search);
  const viewParam = (params.get('view') || '').toLowerCase();
  if (viewParam === 'settings' || viewParam === 'ajustes') return 'view-settings';
  if (viewParam === 'pricing' || viewParam === 'precios') return 'view-pricing';
  if (viewParam === 'adshield') return 'view-adshield';
  if (viewParam === 'login' || viewParam === 'iniciar-sesion') return 'view-login';
  if (viewParam === 'signup' || viewParam === 'registrarse' || viewParam === 'register') return 'view-signup';
  if (viewParam.startsWith('adshield-')) return `view-${viewParam}`;

  const path = normalizePath(window.location.pathname).toLowerCase();
  return PATH_TO_VIEW[path] || 'view-overview';
}

export function pathForView(viewId: string): string {
  return VIEW_TO_PATH[viewId] || '/';
}

function applyViewDom(targetViewId: string) {
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active-view');
    view.classList.add('hidden-view');
  });

  const targetView = document.getElementById(targetViewId);
  if (targetView) {
    targetView.classList.remove('hidden-view');
    targetView.classList.add('active-view');
  }

  const navRoot = targetViewId.startsWith('view-adshield') ? 'view-adshield' : targetViewId;
  document.querySelectorAll('.nav-tab-btn, .wiki-doc-link, .legal-tab-btn').forEach(btn => {
    const t = (btn as HTMLElement).dataset.view;
    if (t === targetViewId || t === navRoot) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.title = VIEW_TITLES[targetViewId] || 'FocusGuard';
  document.getElementById('nav-links-menu')?.classList.remove('active-mobile');
}

export function switchView(
  targetViewId: string,
  opts: { replace?: boolean; skipHistory?: boolean; keepSearch?: boolean } = {}
) {
  if (!document.getElementById(targetViewId)) {
    targetViewId = 'view-overview';
  }

  applyViewDom(targetViewId);
  applyTranslations();

  if (!opts.skipHistory) {
    const path = pathForView(targetViewId);
    const search = opts.keepSearch ? window.location.search : '';
    const next = path + search;
    const current = window.location.pathname + window.location.search;
    if (current !== next) {
      const state = { view: targetViewId };
      if (opts.replace) window.history.replaceState(state, '', next);
      else window.history.pushState(state, '', next);
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refreshLegalToc() {
  const page = document.querySelector('.app-view.active-view') as HTMLElement | null;
  const active = page?.querySelector('.wiki-body') as HTMLElement | null;
  const toc = page?.querySelector('.wiki-toc-list') as HTMLElement | null;
  if (!active || !toc) return;

  toc.innerHTML = '';
  active.querySelectorAll('h2[id]').forEach((heading) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = (heading.textContent || '').replace(/^\d+\.\s*/, '');
    link.addEventListener('click', (event) => {
      event.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toc.querySelectorAll('a').forEach((el) => el.classList.remove('is-active'));
      link.classList.add('is-active');
    });
    item.appendChild(link);
    toc.appendChild(item);
  });

  const main = page?.querySelector('.wiki-main');
  if (main && !main.querySelector('.wiki-related')) {
    const related = document.createElement('div');
    related.className = 'wiki-related';
    const heading = document.createElement('h4');
    heading.textContent = page?.querySelector('[data-wiki-related-label]')?.textContent || 'Related';
    const list = document.createElement('div');
    list.className = 'wiki-related-list';
    page?.querySelectorAll('.wiki-doc-link').forEach((btn) => {
      if ((btn as HTMLElement).classList.contains('active')) return;
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.dataset.view = (btn as HTMLElement).dataset.view;
      copy.textContent = btn.textContent;
      copy.addEventListener('click', (event) => {
        event.preventDefault();
        const viewId = copy.dataset.view;
        if (viewId) switchView(viewId);
      });
      list.appendChild(copy);
    });
    related.appendChild(heading);
    related.appendChild(list);
    main.appendChild(related);
  }
}

export function initUI() {
  window.addEventListener('popstate', () => {
    switchView(viewFromLocation(), { skipHistory: true });
  });

  switchView(viewFromLocation(), { replace: true, keepSearch: true });
  refreshLegalToc();

  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const viewId = (e.currentTarget as HTMLElement).dataset.view;
      if (!viewId || !document.getElementById(viewId)) return;
      e.preventDefault();
      switchView(viewId);
    });
  });

  // Event Delegation for Microsoft-Style Legal Accordions
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const header = target.closest('.ms-accordion-header');
    if (header) {
      const item = header.closest('.ms-accordion-item');
      if (item) {
        const isCurrentlyActive = item.classList.contains('active');
        item.classList.toggle('active');
        const icon = header.querySelector('.ms-accordion-icon');
        if (icon) {
          icon.textContent = isCurrentlyActive ? '+' : '−';
        }
      }
    }
  });

  // European Geo-Currency Detection (Euros € vs Dollars $)
  updatePricingDisplay(false);

  // Pricing Monthly/Annual Toggle
  const btnMonthly = document.getElementById('btn-billing-monthly');
  const btnAnnual = document.getElementById('btn-billing-annual');

  btnMonthly?.addEventListener('click', () => {
    updatePricingDisplay(false);
  });

  btnAnnual?.addEventListener('click', () => {
    updatePricingDisplay(true);
  });

  document.querySelectorAll('.btn-goto-config').forEach(btn => {
    btn.addEventListener('click', () => switchView('view-configurator'));
  });

  document.querySelectorAll('.btn-back-home').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('view-overview');
    });
  });

  document.getElementById('logo-home-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('view-overview');
  });

  // Theme Logic
  const themeToggle = document.getElementById('theme-toggle');
  let isDark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const sunSVG = `<svg class="svg-theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  const moonSVG = `<svg class="svg-theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  function updateTheme() {
    if (isDark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.innerHTML = sunSVG;
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      if (themeToggle) themeToggle.innerHTML = moonSVG;
    }
  }
  updateTheme();

  themeToggle?.addEventListener('click', () => {
    isDark = !isDark;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateTheme();
  });

  // Mobile Navigation Toggle
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const navLinksMenu = document.getElementById('nav-links-menu');

  mobileNavToggle?.addEventListener('click', () => {
    navLinksMenu?.classList.toggle('active-mobile');
  });

  // FAQ Toggles
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      if (answer) {
        answer.classList.toggle('hidden');
        const icon = btn.querySelector('.faq-icon');
        if (icon) {
          icon.textContent = answer.classList.contains('hidden') ? '+' : '-';
        }
      }
    });
  });

  // Modal Theme Selectors
  document.querySelectorAll('.btn-preset[id^="theme-btn-"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-preset[id^="theme-btn-"]').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget as HTMLElement;
      target.classList.add('active');
      if (target.id === 'theme-btn-dark') {
        document.body.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else if (target.id === 'theme-btn-light') {
        document.body.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      } else {
        localStorage.removeItem('theme');
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.body.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.body.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
    });
  });
}

export function isEuropeanUser(): boolean {
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.startsWith('Europe/') || tz.startsWith('Atlantic/Canaries') || tz.startsWith('Atlantic/Madeira') || tz.startsWith('Atlantic/Azores')) {
        return true;
      }
    }
  } catch (e) {}

  if (typeof navigator !== 'undefined') {
    const navLang = (navigator.language || '').toLowerCase();
    const euLocales = ['es-es', 'fr-fr', 'de-de', 'it-it', 'pt-pt', 'nl-nl', 'fi-fi', 'el-gr', 'es', 'fr', 'de', 'pt', 'it', 'nl'];
    if (euLocales.some(loc => navLang === loc || navLang.startsWith(loc))) {
      return true;
    }
  }

  return false;
}

export function updatePricingDisplay(isAnnual: boolean = false) {
  const isEU = isEuropeanUser();
  const btnMonthly = document.getElementById('btn-billing-monthly');
  const btnAnnual = document.getElementById('btn-billing-annual');
  const priceStarter = document.getElementById('price-starter-val');
  const pricePro = document.getElementById('price-pro-val');
  const priceEnt = document.getElementById('price-ent-val');
  const proBtn = document.getElementById('pricing-stripe-btn');
  const entBtn = document.getElementById('pricing-stripe-ent-btn');

  if (priceStarter) {
    priceStarter.innerHTML = isEU ? `0 € <span data-i18n="plan_forever">/ para siempre</span>` : `$0 <span data-i18n="plan_forever">/ forever</span>`;
  }

  if (isAnnual) {
    if (btnAnnual) btnAnnual.classList.add('active');
    if (btnMonthly) btnMonthly.classList.remove('active');

    if (pricePro) pricePro.innerHTML = isEU ? `3,99 € <span>/ mes (47,88 €/año)</span>` : `$3.99 <span>/ month ($47.88/year)</span>`;
    if (priceEnt) priceEnt.innerHTML = isEU ? `15,99 € <span>/ mes (191,88 €/año)</span>` : `$15.99 <span>/ month ($191.88/year)</span>`;
    if (proBtn) proBtn.textContent = isEU ? `Suscribirse a Pro (3,99 €/mes)` : `Subscribe to Pro ($3.99/mo)`;
    if (entBtn) entBtn.textContent = isEU ? `Suscribirse a Empresa (15,99 €/mes)` : `Subscribe to Enterprise ($15.99/mo)`;
  } else {
    if (btnMonthly) btnMonthly.classList.add('active');
    if (btnAnnual) btnAnnual.classList.remove('active');

    if (pricePro) pricePro.innerHTML = isEU ? `4,99 € <span data-i18n="plan_per_mo">/ mes</span>` : `$4.99 <span data-i18n="plan_per_mo">/ month</span>`;
    if (priceEnt) priceEnt.innerHTML = isEU ? `19,99 € <span data-i18n="plan_per_mo">/ mes</span>` : `$19.99 <span data-i18n="plan_per_mo">/ month</span>`;
    if (proBtn) proBtn.textContent = isEU ? `Suscribirse a Pro (4,99 €/mes)` : `Subscribe to Pro ($4.99/mo)`;
    if (entBtn) entBtn.textContent = isEU ? `Suscribirse a Empresa (19,99 €/mes)` : `Subscribe to Enterprise ($19.99/mo)`;
  }
}

