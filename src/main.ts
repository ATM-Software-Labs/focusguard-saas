/**
 * FocusGuard SaaS - Main Application Entry Point
 * Architecture: Modular Component & Feature-Based Design
 */

import { applyTranslations } from './core/i18n';
import { initUI, viewFromLocation } from './core/ui';
import { initAuth } from './features/auth/auth';
import { initAdShield } from './features/adshield/adshield';
import { initDashboard } from './features/dashboard/dashboard';
import { initGenerator } from './features/generator/generator';
import { initSettings, openAccountSettings } from './features/settings/settings';
import { initStripe } from './features/stripe/stripe';
import { initDiagnostics } from './features/diagnostics/diagnostics';
import { initPiHole } from './features/pihole/pihole';

// Re-export core helpers for legacy component bindings
export { showToast } from './core/utils';
export { switchView } from './core/ui';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Core Translations & UI
  applyTranslations();
  initUI();

  // 2. Feature Modules Initialization
  initAuth();
  initAdShield();
  initDashboard();
  initGenerator();
  initSettings();
  initStripe();
  initDiagnostics();
  initPiHole();

  const viewParam = new URLSearchParams(window.location.search).get('view');
  if (viewParam === 'settings' || viewFromLocation() === 'view-settings') {
    openAccountSettings();
  }
});
