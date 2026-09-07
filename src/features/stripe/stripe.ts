import { API_BASE } from '../../core/config';
import { showToast } from '../../core/utils';
import { getAuthToken, getUser, updateAuthUI } from '../auth/auth';

export function updatePricingUI(userTier: 'free' | 'pro' | 'enterprise' = 'free') {
  const freeBtn = document.querySelector('.btn-price-ghost.btn-goto-config') as HTMLButtonElement;
  const proBtn = document.getElementById('pricing-stripe-btn') as HTMLButtonElement;
  const entBtn = document.getElementById('pricing-stripe-ent-btn') as HTMLButtonElement;

  if (userTier === 'pro') {
    if (proBtn) {
      proBtn.textContent = '✓ Tu Plan Actual (Pro Activado)';
      proBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      proBtn.style.color = '#ffffff';
      proBtn.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';
      proBtn.style.pointerEvents = 'none';
      proBtn.style.opacity = '0.95';
    }
    if (entBtn) {
      entBtn.textContent = 'Mejorar a Enterprise ($19.99/mes)';
      entBtn.style.pointerEvents = 'auto';
      entBtn.style.opacity = '1';
      entBtn.style.background = '';
    }
    if (freeBtn) {
      freeBtn.textContent = 'Plan Gratuito (Starter)';
    }
  } else if (userTier === 'enterprise') {
    if (entBtn) {
      entBtn.textContent = '✓ Tu Plan Actual (Enterprise Activado)';
      entBtn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';
      entBtn.style.color = '#ffffff';
      entBtn.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.4)';
      entBtn.style.pointerEvents = 'none';
      entBtn.style.opacity = '0.95';
    }
    if (proBtn) {
      proBtn.textContent = 'Plan Pro (Incluido en Enterprise)';
      proBtn.style.pointerEvents = 'none';
      proBtn.style.opacity = '0.7';
    }
    if (freeBtn) {
      freeBtn.textContent = 'Plan Gratuito (Starter)';
    }
  } else {
    // Free Tier
    if (freeBtn) {
      freeBtn.textContent = '✓ Tu Plan Actual (Gratuito)';
    }
    if (proBtn) {
      proBtn.textContent = 'Suscribirse a Pro ($4.99/mes)';
      proBtn.style.pointerEvents = 'auto';
      proBtn.style.opacity = '1';
      proBtn.style.background = '';
    }
    if (entBtn) {
      entBtn.textContent = 'Suscribirse a Enterprise ($19.99/mes)';
      entBtn.style.pointerEvents = 'auto';
      entBtn.style.opacity = '1';
      entBtn.style.background = '';
    }
  }
}

export async function checkStripeReturnUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutStatus = urlParams.get('checkout');
  const queryTier = (urlParams.get('tier') || 'pro') as 'pro' | 'enterprise';

  if (checkoutStatus === 'success') {
    const token = getAuthToken();
    const user = getUser();

    const newTier = queryTier;
    if (user) {
      user.tier = newTier;
      localStorage.setItem('user', JSON.stringify(user));
    }

    if (token) {
      try {
        await fetch(`${API_BASE}/api/user/sync-tier`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ tier: newTier })
        });
      } catch (e) {
        console.error("Failed to sync tier to backend", e);
      }
    }

    showToast(`🎉 ¡Suscripción ${newTier === 'enterprise' ? 'Enterprise' : 'Pro'} Activada con Éxito!`);
    updateAuthUI();

    // Clean URL query string without reloading page
    const cleanUrl = window.location.protocol + "//" + window.location.host + (window.location.pathname || '/');
    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
  }
}

export async function triggerStripeCheckout(tier: string = 'pro') {
  const token = getAuthToken();
  const userObj = getUser();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/checkout/stripe`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tier, email: userObj?.email || '' })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      showToast(`⚠️ Stripe: ${errData.error || 'Error al iniciar checkout'}`);
    }
  } catch (e) {
    console.error("Stripe checkout failed", e);
    showToast('⚠️ No se pudo conectar con el servidor de pago.');
  }
}

export function initStripe() {
  const stripeBtn = document.getElementById('stripe-upgrade-btn');
  const pricingStripeBtn = document.getElementById('pricing-stripe-btn');
  const pricingStripeEntBtn = document.getElementById('pricing-stripe-ent-btn');
  const modalStripeBtn = document.getElementById('modal-stripe-btn');

  stripeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerStripeCheckout('pro');
  });

  pricingStripeBtn?.addEventListener('click', () => triggerStripeCheckout('pro'));
  pricingStripeEntBtn?.addEventListener('click', () => triggerStripeCheckout('enterprise'));
  modalStripeBtn?.addEventListener('click', () => triggerStripeCheckout('pro'));

  checkStripeReturnUrl();
}
