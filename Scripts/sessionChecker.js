import CONFIG from '../config.js'
export async function checkSession() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) {
      console.warn('⚠️ No session token found.');
      return false;
    }

    const response = await fetch(CONFIG.API_BASE_URL + '/api/check-session', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error('❌ Server responded with error status:', response.status);
      return false;
    }

    const data = await response.json();
    if (data.valid !== true) {
      console.warn('⚠️ Session check returned invalid:', data);
      return false;
    }
    return data.valid === true;

  } catch (error) {
    console.error('❌ Error checking session:', error);
    return false;
  }
}
