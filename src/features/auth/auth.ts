import { API_BASE, DEFAULT_ENDPOINT } from '../../core/config';
import { showToast } from '../../core/utils';
import { switchView } from '../../core/ui';
import type { User } from '../../types';
import { updatePricingUI } from '../stripe/stripe';
import { renderCategories } from '../generator/generator';
import { updateEnterpriseGuidesUI } from '../adshield/adshield';

declare global {
  interface Window {
    google: any;
    handleCredentialResponse: (response: any) => void;
  }
}

let authToken: string | null = localStorage.getItem('token');
let userObj: User | null = JSON.parse(localStorage.getItem('user') || 'null');

export function getAuthToken(): string | null {
  return authToken;
}

export function getUser(): User | null {
  return userObj;
}

export function setUser(user: User) {
  userObj = user;
  localStorage.setItem('user', JSON.stringify(user));
}

export function updateAuthUI() {
  const googleLoginBtnContainer = document.getElementById('google-login-btn-container');
  const userProfile = document.getElementById('user-profile');
  const userName = document.getElementById('user-name');
  const userAvatar = document.getElementById('user-avatar') as HTMLImageElement;
  const authWarning = document.getElementById('auth-warning');

  const userAppDashboard = document.getElementById('user-app-dashboard');
  const dashUserName = document.getElementById('dash-user-name');
  const dashUserEndpoint = document.getElementById('dash-user-endpoint');

  const navDashboard = document.getElementById('nav-dashboard');
  const adminDashboard = document.getElementById('admin-dashboard');

  const userTier = userObj?.tier || 'free';

  if (authToken && userObj) {
    googleLoginBtnContainer?.classList.add('hidden');
    userProfile?.classList.remove('hidden');
    navDashboard?.classList.remove('hidden');

    if (userName) {
      const tierBadgeHtml = userTier === 'enterprise'
        ? `<span class="badge-tier" style="background: rgba(139, 92, 246, 0.2); color: #a78bfa; font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid rgba(139, 92, 246, 0.4); margin-left: 0.4rem;">ENTERPRISE</span>`
        : (userTier === 'pro'
          ? `<span class="badge-tier" style="background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.4); margin-left: 0.4rem;">PRO</span>`
          : `<span class="badge-tier" style="background: rgba(255, 255, 255, 0.08); color: #9ca3af; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; margin-left: 0.4rem;">FREE</span>`);
      
      userName.innerHTML = `${userObj.name} ${tierBadgeHtml}`;
    }

    if (userAvatar && userObj.picture) {
      userAvatar.src = userObj.picture;
      userAvatar.style.display = 'block';
    }
    authWarning?.classList.add('hidden');

    if (userAppDashboard) {
      userAppDashboard.classList.remove('hidden');
      if (dashUserName) dashUserName.textContent = userObj.name;
      if (dashUserEndpoint) dashUserEndpoint.textContent = DEFAULT_ENDPOINT;
    }
  } else {
    googleLoginBtnContainer?.classList.remove('hidden');
    userProfile?.classList.add('hidden');
    navDashboard?.classList.add('hidden');
    adminDashboard?.classList.add('hidden');
    authWarning?.classList.remove('hidden');
    if (userAppDashboard) userAppDashboard.classList.add('hidden');
  }

  updatePricingUI(userTier);
  updateEnterpriseGuidesUI(userTier);
  renderCategories();
}

export function logout() {
  authToken = null;
  userObj = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('focusguard_user_token');
  updateAuthUI();
  showToast('👋 Sesión cerrada correctamente');
}

/** Refresh profile/tier from backend so Enterprise unlocks stay in sync. */
export async function refreshSessionProfile(): Promise<void> {
  if (!authToken) return;

  try {
    const res = await fetch(`${API_BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (res.status === 401 || res.status === 403) {
      // Token expired — clear session quietly
      authToken = null;
      userObj = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      updateAuthUI();
      return;
    }

    if (!res.ok) return;

    const data = await res.json();
    const remote = data.user;
    if (!remote) return;

    const nextTier = (remote.tier || userObj?.tier || 'free') as User['tier'];
    userObj = {
      ...(userObj || { name: '', email: '' }),
      id: remote.id || userObj?.id,
      name: remote.name || userObj?.name || '',
      email: remote.email || userObj?.email || '',
      picture: remote.picture || userObj?.picture,
      tier: nextTier
    };
    localStorage.setItem('user', JSON.stringify(userObj));

    // Persist dedicated DNS tenant token for DoH / guides
    if (data.tenant?.token) {
      localStorage.setItem('focusguard_user_token', data.tenant.token);
      if (data.tenant.doh_url) {
        localStorage.setItem('focusguard_doh_url', data.tenant.doh_url);
      }
    }
    if (Array.isArray(data.devices) && data.devices[0]?.hardware_id) {
      localStorage.setItem('focusguard_hardware_id', data.devices[0].hardware_id);
    }

    updateAuthUI();
  } catch (e) {
    console.warn('Session profile refresh failed', e);
  }
}

export function initAuth() {
  window.handleCredentialResponse = async (response: any) => {
    try {
      showToast('🔑 Verificando cuenta con Google...');
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      if (res.ok) {
        const data = await res.json();
        authToken = data.token;
        userObj = data.user;
        localStorage.setItem('token', authToken as string);
        localStorage.setItem('user', JSON.stringify(userObj));
        document.getElementById('modal-auth')?.classList.add('hidden');
        updateAuthUI();
        switchView('view-overview');
        showToast(`¡Bienvenido ${userObj?.name}! Panel desbloqueado`);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`⚠️ Error en autenticación con Google: ${errData.error || 'Verificación fallida'}`);
      }
    } catch (e) {
      console.error("Login failed", e);
      showToast("⚠️ Error de conexión con el servidor de autenticación.");
    }
  };

  // Email Auth Modal & Handlers
  const modalAuth = document.getElementById('modal-auth');
  const btnOpenAuth = document.getElementById('btn-open-email-auth');
  const btnCloseAuth = document.getElementById('modal-auth-close');

  const tabLogin = document.getElementById('auth-tab-login');
  const tabRegister = document.getElementById('auth-tab-register');

  const formLogin = document.getElementById('form-auth-login');
  const formRegister = document.getElementById('form-auth-register');
  const formVerify = document.getElementById('form-auth-verify');
  const formForgot = document.getElementById('form-auth-forgot');
  const formReset = document.getElementById('form-auth-reset');
  const formX = document.getElementById('form-auth-x');

  const showForm = (activeForm: HTMLElement | null) => {
    [formLogin, formRegister, formVerify, formForgot, formReset, formX].forEach(f => f?.classList.add('hidden'));
    activeForm?.classList.remove('hidden');
  };

  btnOpenAuth?.addEventListener('click', () => {
    switchView('view-login');
  });

  btnCloseAuth?.addEventListener('click', () => {
    modalAuth?.classList.add('hidden');
  });

  modalAuth?.addEventListener('click', (e) => {
    if (e.target === modalAuth) modalAuth.classList.add('hidden');
  });

  tabLogin?.addEventListener('click', () => {
    showForm(formLogin);
    tabLogin.style.background = 'var(--bg-card)';
    tabLogin.style.borderColor = 'var(--border)';
    tabLogin.style.color = 'var(--text-main)';
    if (tabRegister) {
      tabRegister.style.background = 'transparent';
      tabRegister.style.borderColor = 'transparent';
      tabRegister.style.color = 'var(--text-muted)';
    }
  });

  tabRegister?.addEventListener('click', () => {
    showForm(formRegister);
    tabRegister.style.background = 'var(--bg-card)';
    tabRegister.style.borderColor = 'var(--border)';
    tabRegister.style.color = 'var(--text-main)';
    if (tabLogin) {
      tabLogin.style.background = 'transparent';
      tabLogin.style.borderColor = 'transparent';
      tabLogin.style.color = 'var(--text-muted)';
    }
  });

  // Password Eye Toggle Helpers
  const setupEyeToggle = (btnId: string, inputId: string) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    btn?.addEventListener('click', () => {
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.style.color = isPassword ? 'var(--primary)' : 'var(--text-muted)';
    });
  };
  setupEyeToggle('btn-toggle-login-password', 'login-password');
  setupEyeToggle('btn-toggle-register-password', 'register-password');
  setupEyeToggle('btn-toggle-page-login-password', 'page-login-password');
  setupEyeToggle('btn-toggle-page-register-password', 'page-register-password');

  // Real-Time Password Strength Meter
  const regPasswordInput = document.getElementById('register-password') as HTMLInputElement | null;
  const strengthFill = document.getElementById('register-password-strength-fill');
  const strengthTxt = document.getElementById('register-password-strength-txt');

  regPasswordInput?.addEventListener('input', () => {
    const val = regPasswordInput.value;
    if (!val || !strengthFill || !strengthTxt) {
      if (strengthFill) strengthFill.style.width = '0%';
      if (strengthTxt) {
        strengthTxt.textContent = 'Seguridad de clave: Mínimo 6 caracteres';
        strengthTxt.style.color = 'var(--text-muted)';
      }
      return;
    }

    let score = 0;
    if (val.length >= 6) score += 25;
    if (val.length >= 10) score += 25;
    if (/[0-9]/.test(val)) score += 25;
    if (/[^A-Za-z0-9]/.test(val) || /[A-Z]/.test(val)) score += 25;

    strengthFill.style.width = `${score}%`;
    if (score <= 25) {
      strengthFill.style.backgroundColor = '#ef4444';
      strengthTxt.textContent = '🔒 Seguridad: Débil (Añade números y mayúsculas)';
      strengthTxt.style.color = '#ef4444';
    } else if (score <= 75) {
      strengthFill.style.backgroundColor = '#f59e0b';
      strengthTxt.textContent = '🛡️ Seguridad: Media (Buena combinación)';
      strengthTxt.style.color = '#f59e0b';
    } else {
      strengthFill.style.backgroundColor = '#10b981';
      strengthTxt.textContent = '⚡ Seguridad: Ultra-Fuerte (Nivel Encriptado)';
      strengthTxt.style.color = '#10b981';
    }
  });

  // Magic Link Button Handler
  document.getElementById('btn-magic-link')?.addEventListener('click', async () => {
    const emailInput = (document.getElementById('login-email') as HTMLInputElement)?.value;
    if (!emailInput) {
      showToast('⚠️ Introduce tu correo arriba para enviar el Magic Link');
      (document.getElementById('login-email') as HTMLInputElement)?.focus();
      return;
    }

    try {
      showToast('✨ Generando Magic Link vía Resend API...');
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      if (res.ok) {
        showToast('✉️ Magic Link de acceso enviado a tu correo. Revisa tu bandeja de entrada.');
      } else {
        showToast('⚠️ Error al generar Magic Link');
      }
    } catch (e) {
      showToast('⚠️ fallo de conexión al enviar Magic Link');
    }
  });

  // 1. LOGIN FORM SUBMIT
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('login-email') as HTMLInputElement)?.value;
    const password = (document.getElementById('login-password') as HTMLInputElement)?.value;

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Error de inicio de sesión'}`);
        return;
      }
      authToken = data.token;
      userObj = data.user;
      localStorage.setItem('token', authToken as string);
      localStorage.setItem('user', JSON.stringify(userObj));
      modalAuth?.classList.add('hidden');
      updateAuthUI();
      showToast(`¡Bienvenido de nuevo ${userObj?.name}!`);
    } catch (err: any) {
      showToast('⚠️ Error de conexión con el servidor');
    }
  });

  // 2. REGISTER FORM SUBMIT -> RESEND VERIFICATION CODE
  let currentPendingEmail = '';
  formRegister?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('register-name') as HTMLInputElement)?.value;
    const email = (document.getElementById('register-email') as HTMLInputElement)?.value;
    const password = (document.getElementById('register-password') as HTMLInputElement)?.value;

    try {
      showToast('Enviando código de verificación vía Resend API...');
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Error al registrar'}`);
        return;
      }
      currentPendingEmail = email;
      const targetSpan = document.getElementById('verify-target-email');
      if (targetSpan) targetSpan.textContent = email;
      showForm(formVerify);
      showToast(`✉️ Código enviado a ${email}`);
    } catch (err: any) {
      showToast('⚠️ Error al enviar email de verificación');
    }
  });

  // 3. VERIFY CODE FORM SUBMIT
  formVerify?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = (document.getElementById('verify-code') as HTMLInputElement)?.value;

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentPendingEmail, code })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Código incorrecto'}`);
        return;
      }
      authToken = data.token;
      userObj = data.user;
      localStorage.setItem('token', authToken as string);
      localStorage.setItem('user', JSON.stringify(userObj));
      modalAuth?.classList.add('hidden');
      updateAuthUI();
      showToast(`🎉 ¡Cuenta verificada y acceso concedido, ${userObj?.name}!`);
    } catch (err: any) {
      showToast('⚠️ Error al verificar el código');
    }
  });

  // 4. FORGOT PASSWORD LINK
  document.getElementById('link-forgot-password')?.addEventListener('click', (e) => {
    e.preventDefault();
    showForm(formForgot);
  });

  document.getElementById('forgot-back-to-login')?.addEventListener('click', () => {
    showForm(formLogin);
  });

  // 5. FORGOT PASSWORD SUBMIT -> SEND CODE VIA RESEND
  let currentResetEmail = '';
  formForgot?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('forgot-email') as HTMLInputElement)?.value;
    currentResetEmail = email;

    try {
      showToast('Enviando código de recuperación vía Resend API...');
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Error al procesar la solicitud'}`);
        return;
      }
      showForm(formReset);
      showToast('🔑 Revisa tu email para ver el código de recuperación');
    } catch (err: any) {
      showToast('⚠️ Error al enviar email de recuperación');
    }
  });

  // 6. RESET PASSWORD SUBMIT WITH CODE
  formReset?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = (document.getElementById('reset-code') as HTMLInputElement)?.value;
    const newPassword = (document.getElementById('reset-new-password') as HTMLInputElement)?.value;

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentResetEmail, code, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Código o contraseña incorrectos'}`);
        return;
      }
      showToast('✅ Contraseña restablecida. Inicia sesión con tu nueva clave.');
      showForm(formLogin);
    } catch (err: any) {
      showToast('⚠️ Error al restablecer la contraseña');
    }
  });

  // 7. X.COM (TWITTER) DIRECT OAUTH 2.0 PKCE REDIRECT HANDLER
  const X_CLIENT_ID = 'NF94WVVIT1dzSXZNaTJuYjRXSEc6MTpjaQ';

  document.getElementById('btn-login-x')?.addEventListener('click', () => {
    showToast('Redirigiendo a la autorización oficial de X (Twitter)...');
    
    const state = 'x_oauth_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('focusguard_x_oauth_state', state);

    const redirectUri = encodeURIComponent(window.location.origin + '/?auth=x_callback');
    const xAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${X_CLIENT_ID}&redirect_uri=${redirectUri}&scope=users.read%20tweet.read&state=${state}&code_challenge=challenge&code_challenge_method=plain`;

    window.location.href = xAuthUrl;
  });

  formX?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const handleInput = (document.getElementById('x-username-input') as HTMLInputElement)?.value || '';
    const handle = handleInput.trim().replace(/^@/, '');
    if (!handle) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/x`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Error al autenticar con X.com'}`);
        return;
      }
      authToken = data.token;
      userObj = data.user;
      localStorage.setItem('token', authToken as string);
      localStorage.setItem('user', JSON.stringify(userObj));
      modalAuth?.classList.add('hidden');
      updateAuthUI();
      showToast(`¡Bienvenido ${userObj?.name} desde X.com!`);
    } catch (err) {
      showToast('⚠️ Error al conectar con X.com');
    }
  });

  document.getElementById('btn-x-oauth-redirect')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Redirigiendo a la autorización oficial de X (Twitter)...');
    
    const state = 'x_oauth_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('focusguard_x_oauth_state', state);

    const redirectUri = encodeURIComponent(window.location.origin + '/?auth=x_callback');
    const xAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${X_CLIENT_ID}&redirect_uri=${redirectUri}&scope=users.read%20tweet.read&state=${state}&code_challenge=challenge&code_challenge_method=plain`;

    window.location.href = xAuthUrl;
  });

  // Handle incoming X OAuth callback
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('auth') === 'x_callback' || urlParams.get('state')?.startsWith('x_oauth_')) {
    const code = urlParams.get('code') || 'x_auth_success';
    window.history.replaceState({}, document.title, window.location.pathname);
    
    void (async () => {
      try {
        const redirectUri = window.location.origin + '/?auth=x_callback';
        const res = await fetch(`${API_BASE}/api/auth/x`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          authToken = data.token;
          userObj = data.user;
          localStorage.setItem('token', authToken as string);
          localStorage.setItem('user', JSON.stringify(userObj));
          updateAuthUI();
          showToast(`¡Bienvenido ${userObj?.name} desde X.com!`);
        }
      } catch (e) {
        console.error('X OAuth Callback error', e);
      }
    })();
  }

  // FULL PAGE /LOGIN & /SIGNUP FORM HANDLERS
  document.getElementById('form-login-page')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('page-login-email') as HTMLInputElement)?.value;
    const password = (document.getElementById('page-login-password') as HTMLInputElement)?.value;

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Error de inicio de sesión'}`);
        return;
      }
      authToken = data.token;
      userObj = data.user;
      localStorage.setItem('token', authToken as string);
      localStorage.setItem('user', JSON.stringify(userObj));
      updateAuthUI();
      switchView('view-overview');
      showToast(`¡Bienvenido de nuevo ${userObj?.name}!`);
    } catch (err) {
      showToast('⚠️ Error de conexión al iniciar sesión');
    }
  });

  document.getElementById('form-signup-page')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('page-register-name') as HTMLInputElement)?.value;
    const email = (document.getElementById('page-register-email') as HTMLInputElement)?.value;
    const password = (document.getElementById('page-register-password') as HTMLInputElement)?.value;

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Error al registrar cuenta'}`);
        return;
      }
      showToast(`✉️ Código enviado a ${email}. Verifica tu correo.`);
      const verifyTarget = document.getElementById('verify-target-email');
      if (verifyTarget) verifyTarget.textContent = email;
      modalAuth?.classList.remove('hidden');
      showForm(formVerify);
    } catch (err) {
      showToast('⚠️ Error de conexión al registrar cuenta');
    }
  });

  // Dedicated Google GIS & X.com OAuth buttons on /login and /signup pages
  const triggerGoogleAuth = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '161745150528-5pb84k9upvamvlvnc7lg6nr1ku74vc4a.apps.googleusercontent.com',
        callback: window.handleCredentialResponse,
        auto_select: false
      });
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google One Tap prompt closed/skipped:', notification);
        }
      });
    } else {
      showToast('⚠️ Cargando Google Sign-In... Por favor reintenta en un instante.');
    }
  };

  ['btn-page-google', 'btn-page-signup-google', 'inline-login-btn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('view-login');
      triggerGoogleAuth();
    });
  });

  ['btn-page-x', 'btn-page-signup-x'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      showToast('Redirigiendo a la autorización oficial de X (Twitter)...');
      const state = 'x_oauth_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('focusguard_x_oauth_state', state);
      const redirectUri = encodeURIComponent(window.location.origin + '/?auth=x_callback');
      const xAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${X_CLIENT_ID}&redirect_uri=${redirectUri}&scope=users.read%20tweet.read&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
      window.location.href = xAuthUrl;
    });
  });
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.id === 'logout-btn' || target.closest('#logout-btn'))) {
      e.preventDefault();
      e.stopPropagation();
      logout();
    }
  });

  updateAuthUI();
  // Re-sync tier (Enterprise guides unlock) from Cloudflare D1
  void refreshSessionProfile();
}
