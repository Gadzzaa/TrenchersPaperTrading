import { showSpinner, hideSpinner } from './spinner.js'; // 🔥 loading
import { showNotification } from './notificationSystem.js'; // 🔥 notification
import CONFIG from '../config.js';


export async function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const loginButton = document.getElementById('loginButton');
  const rememberMe = document.getElementById('rememberMeCheckbox').checked;
  if (!username || !password) {
    showNotification('Please fill in both fields.', 'error');
    return;
  }

  showSpinner();
  loginButton.disabled = true; // 🔥 Disable the login button

  // Optional: also change button style slightly
  loginButton.style.opacity = '0.6';
  loginButton.style.cursor = 'not-allowed';

  await new Promise(resolve => setTimeout(resolve, 600)); // 600ms small delay

  try {
    const response = await fetch(CONFIG.API_BASE_URL + '/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();


    if (response.ok) {
      if (!result.token) {
        showNotification('Invalid token received. Please try again.', 'error');
        return;
      }
      showNotification('Login Successful', 'success');
      localStorage.setItem('loggedInUsername', username);
      localStorage.setItem('sessionToken', result.token);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
        loginButton.disabled = false; // 🔥 Re-enable button
        loginButton.style.opacity = '1';
        loginButton.style.cursor = 'pointer';
        hideSpinner();
      }, 1000);
    } else {
      showNotification(result.message || 'Login Failed', 'error');
      loginButton.disabled = false; // 🔥 Re-enable button
      loginButton.style.opacity = '1';
      loginButton.style.cursor = 'pointer';
      hideSpinner();
    }
  } catch (error) {
    loginButton.disabled = false; // 🔥 Re-enable button
    loginButton.style.opacity = '1';
    loginButton.style.cursor = 'pointer';
    hideSpinner();

    showNotification('Server Error', 'error');
    console.error('Login error:', error);
  }
  if (rememberMe) {
    localStorage.setItem('rememberedUsername', username);
  } else {
    localStorage.removeItem('rememberedUsername');
  }
}
