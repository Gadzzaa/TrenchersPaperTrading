import { showSpinner, hideSpinner } from './spinner.js'; // 🔥 loading
import { showNotification } from './notificationSystem.js'; // 🔥 notification
import CONFIG from '../config.js'

export async function handleRegister() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const registerButton = document.getElementById('registerButton');

  if (!username || !password) {
    showNotification('Please fill in both fields.', 'error');
    return;
  }
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters.', 'error');
    return;
  }

  showSpinner();
  registerButton.disabled = true; // 🔥 Disable register button
  registerButton.style.opacity = '0.6';
  registerButton.style.cursor = 'not-allowed';

  await new Promise(resolve => setTimeout(resolve, 600)); // 600ms small delay

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(CONFIG.API_BASE_URL + '/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const result = await response.json();

      if (response.ok) {
        if (!result.token) {
          showNotification('No token received from server.', 'error');
          return;
        }
        localStorage.setItem('loggedInUsername', username);
        localStorage.setItem('sessionToken', result.token);
        showNotification('✅ Account created. You can now log in.', 'success');
        hideSpinner();
        break;
      } else {
        showNotification(result.message || 'Registration failed.', 'error');
      }
    } catch (error) {
      if (attempt === 1) {
        registerButton.disabled = false; // 🔥 Re-enable
        registerButton.style.opacity = '1';
        registerButton.style.cursor = 'pointer';
        hideSpinner();
        showNotification('Server Error', 'error');
        console.error('Register error:', error);
        return;
      }
      console.warn(`Retrying register... (${attempt + 1})`);
      showNotification('Retrying...', 'warning');
    }
  }
}
