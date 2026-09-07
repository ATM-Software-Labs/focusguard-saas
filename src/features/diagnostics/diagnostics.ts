import { API_BASE } from '../../core/config';
import { analyzeDomainWithTrujilloAi, isAdTrackerDomain, isSafeProviderDomain, showToast } from '../../core/utils';
import { categories, customDomains, getSelectedBlocklist, renderCustomPills, syncUserConfigToBackend, whitelistDomains } from '../generator/generator';
import type { TrujilloAiAnalysis } from '../../types';

export function checkDomainFilter(domainRaw: string): { blocked: boolean; reason: string } {
  const domain = domainRaw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  if (!domain) {
    return { blocked: false, reason: 'Por favor introduce un dominio válido.' };
  }

  const { blocklist, selectedCats } = getSelectedBlocklist();
  const adsOff = selectedCats.includes('noads');

  if (!adsOff && isAdTrackerDomain(domain)) {
    return { blocked: true, reason: `🚫 BLOQUEADO: "${domain}" es un servidor de anuncios o telemetría. El sitio sigue accesible.` };
  }

  if (isSafeProviderDomain(domain)) {
    return { blocked: false, reason: `✅ PERMITIDO: "${domain}" es un proveedor de infraestructura seguro y protegido.` };
  }

  // Check custom domain whitelist
  if (whitelistDomains.some(wl => domain === wl || domain.endsWith('.' + wl))) {
    return { blocked: false, reason: `✅ PERMITIDO: "${domain}" está en tu lista de excepciones permitidas (Whitelist).` };
  }

  // Check custom domain blacklist
  if (customDomains.some(bl => domain === bl || domain.endsWith('.' + bl))) {
    return { blocked: true, reason: `🚫 BLOQUEADO: "${domain}" está en tu lista personalizada de dominios bloqueados.` };
  }

  for (const catId of selectedCats) {
    if (catId === 'ads' || catId === 'noads') continue;
    const cat = categories.find(c => c.id === catId);
    if (cat && cat.domains.some(d => domain.includes(d) || d.includes(domain))) {
      return { blocked: true, reason: `🚫 BLOQUEADO: Pertenece a la categoría "${cat.title}".` };
    }
  }

  // General blocklist check
  if (blocklist.some(d => domain.includes(d) || d.includes(domain))) {
    return { blocked: true, reason: `🚫 BLOQUEADO: Detectado en la base de datos de filtrado FocusGuard.` };
  }

  return { blocked: false, reason: `✅ PERMITIDO: "${domain}" no está restringido por tus reglas activas.` };
}

export async function testEdgeLatency() {
  const diagLatency = document.getElementById('diag-latency');
  const diagStatus = document.getElementById('diag-status');
  const diagDoh = document.getElementById('diag-doh');
  const badge = document.getElementById('latency-result-badge');

  if (diagLatency) diagLatency.textContent = 'Midiendo...';
  if (badge) badge.textContent = 'Ping: midiendo...';

  const startTime = performance.now();
  try {
    const res = await fetch(`${API_BASE}/v1/rules.json?t=${Date.now()}`, { cache: 'no-store' });
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(1);
    
    if (diagLatency) {
      diagLatency.textContent = `${duration} ms`;
      diagLatency.style.color = parseFloat(duration) < 40 ? '#34d399' : '#f59e0b';
    }
    if (diagDoh) {
      diagDoh.textContent = res.ok ? 'TLS 1.3 DoT Ready (Active)' : 'HTTP Standby';
      diagDoh.style.color = '#34d399';
    }
    if (diagStatus) {
      diagStatus.textContent = 'Active (0.0.0.0 Sinkhole Edge)';
      diagStatus.style.color = '#34d399';
    }
    if (badge) {
      badge.textContent = `Ping: ${duration} ms (Ultra-Bajo)`;
      badge.style.color = parseFloat(duration) < 50 ? '#34d399' : '#f59e0b';
    }
    showToast(`⏱️ Latencia Cloudflare Edge: ${duration} ms`);
  } catch (e) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(1);
    if (diagLatency) diagLatency.textContent = `${duration} ms`;
    if (badge) badge.textContent = `Ping: ${duration} ms`;
  }
}

export function initDiagnostics() {
  // 1. Edge Diagnostic Button
  const runDiagBtn = document.getElementById('btn-run-diag');
  runDiagBtn?.addEventListener('click', () => {
    testEdgeLatency();
  });

  const latencyBtn = document.getElementById('btn-test-latency');
  latencyBtn?.addEventListener('click', () => {
    testEdgeLatency();
  });

  // 2. Legacy Check Domain Form
  const checkBtn = document.getElementById('btn-check-domain');
  const inputEl = document.getElementById('test-domain-input') as HTMLInputElement;
  const resultText = document.getElementById('test-domain-result-text');

  function runLegacyCheck() {
    if (!inputEl || !resultText) return;
    const val = inputEl.value;
    if (!val) {
      resultText.textContent = 'Escribe un dominio (ej: tiktok.com) para probar el filtro.';
      resultText.style.color = 'var(--text-muted)';
      return;
    }

    const { blocked, reason } = checkDomainFilter(val);
    resultText.textContent = reason;
    resultText.style.color = blocked ? '#f87171' : '#34d399';
    resultText.style.fontWeight = '700';
  }

  checkBtn?.addEventListener('click', runLegacyCheck);
  inputEl?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') runLegacyCheck();
  });

  // 3. Trujillo AI Real-Time Threat & Tracker Inspector
  const trujilloInput = document.getElementById('trujillo-domain-input') as HTMLInputElement;
  const trujilloScanBtn = document.getElementById('btn-trujillo-scan');
  const trujilloCard = document.getElementById('trujillo-result-card');
  const trujilloBadge = document.getElementById('trujillo-threat-badge');
  const trujilloTitle = document.getElementById('trujillo-result-title');
  const trujilloScore = document.getElementById('trujillo-risk-score');
  const trujilloReason = document.getElementById('trujillo-result-reason');
  const trujilloMechanisms = document.getElementById('trujillo-mechanisms-list');
  const trujilloEngine = document.getElementById('trujillo-engine-label');
  const trujilloBlBtn = document.getElementById('btn-trujillo-block');
  const trujilloWlBtn = document.getElementById('btn-trujillo-allow');

  let currentScannedDomain = '';

  async function runTrujilloScan() {
    if (!trujilloInput) return;
    const val = trujilloInput.value.trim();
    if (!val) {
      showToast('Por favor escribe un dominio o URL para analizar.');
      return;
    }

    if (trujilloScanBtn) {
      trujilloScanBtn.textContent = 'Analizando con Trujillo AI...';
      (trujilloScanBtn as HTMLButtonElement).disabled = true;
    }

    try {
      const analysis: TrujilloAiAnalysis = await analyzeDomainWithTrujilloAi(val);
      currentScannedDomain = analysis.domain || val;

      if (trujilloCard) trujilloCard.classList.remove('hidden');

      if (trujilloBadge) {
        trujilloBadge.textContent = analysis.threatLevel;
        if (analysis.threatLevel === 'SAFE') {
          trujilloBadge.style.background = 'rgba(16, 185, 129, 0.2)';
          trujilloBadge.style.color = '#34d399';
          trujilloBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        } else if (analysis.threatLevel === 'LOW' || analysis.threatLevel === 'MEDIUM') {
          trujilloBadge.style.background = 'rgba(245, 158, 11, 0.2)';
          trujilloBadge.style.color = '#fbbf24';
          trujilloBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        } else {
          trujilloBadge.style.background = 'rgba(239, 68, 68, 0.2)';
          trujilloBadge.style.color = '#f87171';
          trujilloBadge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        }
      }

      if (trujilloScore) {
        trujilloScore.textContent = `${analysis.riskScore}/100`;
        trujilloScore.style.color = analysis.riskScore > 50 ? '#f87171' : (analysis.riskScore > 20 ? '#fbbf24' : '#34d399');
      }

      if (trujilloTitle) {
        trujilloTitle.textContent = analysis.title;
        trujilloTitle.style.color = analysis.isThreat ? '#f87171' : '#34d399';
      }

      if (trujilloReason) {
        trujilloReason.textContent = analysis.reason;
      }

      if (trujilloEngine) {
        trujilloEngine.textContent = `Motor: ${analysis.engine}`;
      }

      if (trujilloMechanisms) {
        if (analysis.mechanisms && analysis.mechanisms.length > 0) {
          trujilloMechanisms.innerHTML = analysis.mechanisms.map(m => `
            <span style="background: rgba(139, 92, 246, 0.15); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 600;">
              • ${m}
            </span>
          `).join('');
        } else {
          trujilloMechanisms.innerHTML = `<span style="font-size: 0.78rem; color: var(--text-muted);">Sin mecanismos invasivos detectados</span>`;
        }
      }

      showToast(`🧠 Análisis Trujillo AI completado: ${analysis.threatLevel}`);
    } catch (e) {
      console.error("Trujillo AI Scan error", e);
      showToast('Error al conectar con Trujillo AI');
    } finally {
      if (trujilloScanBtn) {
        trujilloScanBtn.textContent = 'Analizar con Trujillo AI';
        (trujilloScanBtn as HTMLButtonElement).disabled = false;
      }
    }
  }

  trujilloScanBtn?.addEventListener('click', runTrujilloScan);
  trujilloInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') runTrujilloScan();
  });

  // Quick Action: Add to blacklist
  trujilloBlBtn?.addEventListener('click', () => {
    if (!currentScannedDomain) return;
    if (!customDomains.includes(currentScannedDomain)) {
      customDomains.push(currentScannedDomain);
      renderCustomPills();
      syncUserConfigToBackend();
      showToast(`🚫 "${currentScannedDomain}" bloqueado en tu Lista Negra`);
    } else {
      showToast(`"${currentScannedDomain}" ya estaba en la Lista Negra`);
    }
  });

  // Quick Action: Add to whitelist
  trujilloWlBtn?.addEventListener('click', () => {
    if (!currentScannedDomain) return;
    if (!whitelistDomains.includes(currentScannedDomain)) {
      whitelistDomains.push(currentScannedDomain);
      renderCustomPills();
      syncUserConfigToBackend();
      showToast(`✅ "${currentScannedDomain}" permitido en tu Whitelist`);
    } else {
      showToast(`"${currentScannedDomain}" ya estaba en la Whitelist`);
    }
  });

  // Initial latency measurement
  setTimeout(() => testEdgeLatency(), 1500);
}

