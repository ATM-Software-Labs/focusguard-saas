import { API_BASE, AD_TRACKER_PATTERNS, isTopSiteEntryHost, SAFE_PROVIDERS_PATTERNS } from './config';
import type { TrujilloAiAnalysis } from '../types';

export function isAdTrackerDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  if (isTopSiteEntryHost(d)) return false;
  return AD_TRACKER_PATTERNS.some((pattern) => d.includes(pattern));
}

export function isSafeProviderDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  if (isAdTrackerDomain(d)) return false;
  return SAFE_PROVIDERS_PATTERNS.some(pattern => d.includes(pattern));
}

export function showToast(message: string) {
  const toastContainer = document.getElementById('toast-container');
  const toastText = document.getElementById('toast-text');
  if (toastContainer && toastText) {
    toastText.textContent = message;
    toastContainer.classList.remove('hidden');
    setTimeout(() => {
      toastContainer.classList.add('hidden');
    }, 3000);
  }
}

/** Client & Edge Bridge for Trujillo AI Threat & Tracker Analyzer */
export async function analyzeDomainWithTrujilloAi(domainRaw: string): Promise<TrujilloAiAnalysis> {
  const domain = domainRaw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  if (!domain) {
    return {
      domain: '',
      isThreat: false,
      threatCategory: 'clean',
      threatLevel: 'SAFE',
      riskScore: 0,
      title: 'Dominio Vacío',
      reason: 'Por favor introduce un dominio válido para analizar.',
      mechanisms: [],
      actionRecommendation: 'allow',
      engine: 'Trujillo AI Enterprise Threat Engine'
    };
  }

  try {
    const res = await fetch(`${API_BASE}/api/trujillo-ai/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain })
    });
    if (res.ok) {
      return await res.json() as TrujilloAiAnalysis;
    }
  } catch {
    // offline fallback below
  }

  // Client-side heuristics fallback
  if (isSafeProviderDomain(domain)) {
    return {
      domain,
      isThreat: false,
      threatCategory: 'clean',
      threatLevel: 'SAFE',
      riskScore: 2,
      title: 'Infraestructura Cloud Segura',
      reason: `El dominio "${domain}" es un proveedor de infraestructura o IA seguro verificado.`,
      mechanisms: ['Infraestructura Verificada', 'Cero Rastreo Publicitario'],
      actionRecommendation: 'allow',
      engine: 'Trujillo AI Client Heuristics'
    };
  }

  if (isAdTrackerDomain(domain)) {
    return {
      domain,
      isThreat: true,
      threatCategory: 'ad_tracker',
      threatLevel: 'HIGH',
      riskScore: 88,
      title: 'Rastreador Publicitario & Telemetría',
      reason: `Detectado servidor de publicidad invasiva, pixel de remarketing o recolección de métricas.`,
      mechanisms: ['Pixel de Seguimiento', 'Red de Anuncios', 'Telemetría de Usuario'],
      actionRecommendation: 'block',
      engine: 'Trujillo AI Client Heuristics'
    };
  }

  return {
    domain,
    isThreat: false,
    threatCategory: 'clean',
    threatLevel: 'SAFE',
    riskScore: 10,
    title: 'Dominio Limpio / Desconocido',
    reason: `El dominio "${domain}" no figura en bases de rastreo conocidas ni presenta firmas anómalas.`,
    mechanisms: ['Estructura DNS Válida'],
    actionRecommendation: 'allow',
    engine: 'Trujillo AI Client Heuristics'
  };
}
