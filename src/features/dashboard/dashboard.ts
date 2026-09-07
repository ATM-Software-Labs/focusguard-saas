import { API_BASE, DEFAULT_ENDPOINT } from '../../core/config';
import { showToast } from '../../core/utils';
import { getAuthToken } from '../auth/auth';

export function initDashboard() {
  const masterShieldSwitch = document.getElementById('master-shield-switch') as HTMLInputElement;
  const dashUserEndpoint = document.getElementById('dash-user-endpoint');
  const navDashboard = document.getElementById('nav-dashboard');
  const adminDashboard = document.getElementById('admin-dashboard');

  // Master Shield Switch Handler
  masterShieldSwitch?.addEventListener('change', async () => {
    const isEnabled = masterShieldSwitch.checked;
    const statusNum = document.getElementById('dash-stat-blocked');
    if (statusNum) {
      statusNum.style.opacity = isEnabled ? '1' : '0.4';
    }
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`${API_BASE}/api/user/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ enabled: isEnabled })
        });
        showToast('Shield Status Synced to Edge');
      } catch (e) {
        console.error("Config sync failed", e);
      }
    }
  });

  // Copy Endpoint Hostname Button
  document.getElementById('btn-copy-endpoint')?.addEventListener('click', async () => {
    const textToCopy = dashUserEndpoint?.textContent || DEFAULT_ENDPOINT;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Dedicated Hostname Copied to Clipboard');
    } catch (e) {
      console.error(e);
    }
  });

  // Admin Dashboard User List Toggle & Fetch
  navDashboard?.addEventListener('click', async () => {
    adminDashboard?.classList.toggle('hidden');
    const token = getAuthToken();
    if (!adminDashboard?.classList.contains('hidden') && token) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const users = await res.json();
          const tbody = document.getElementById('users-table-body');
          if (tbody) {
            tbody.innerHTML = users.map((u: any) => `
              <tr>
                <td style="padding: 1rem;"><img src="${u.picture || ''}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" /></td>
                <td style="padding: 1rem; font-weight:600;">${u.name}</td>
                <td style="padding: 1rem; color:var(--text-muted);">${u.email}</td>
                <td style="padding: 1rem; color:var(--text-muted);">${new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            `).join('');
          }
        }
      } catch (e) {
        console.error(e);
      }
      adminDashboard?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
