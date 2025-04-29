import { handleLogin } from './loginHandler.js';
import { handleRegister } from './registerHandler.js';
import { showSpinner, hideSpinner } from './spinner.js'; // 🔥 loading
import { checkSession } from './sessionChecker.js'; // 🔥 session
import { showNotification } from './notificationSystem.js'; // 🔥 notification
document.getElementById('loginButton').addEventListener('click', handleLogin);
document.getElementById('registerButton').addEventListener('click', handleRegister);

window.addEventListener('DOMContentLoaded', async () => {
  showSpinner(); // 🔥 Start showing loading spinner

  const sessionToken = localStorage.getItem('sessionToken');
  const rememberedUsername = localStorage.getItem('rememberedUsername');

  if (sessionToken) {
    const isSessionValid = await checkSession();

    if (isSessionValid) {
      console.log('✅ Session valid, redirecting to dashboard');
      window.location.href = 'dashboard.html';
      return; // Stop executing further
    } else {
      console.warn('⚠️ Session invalid, clearing token');
      localStorage.removeItem('sessionToken');
      // allow user to log in again
    }
  }

  // If we get here, session was invalid or missing
  if (rememberedUsername) {
    document.getElementById('username').value = rememberedUsername;
    document.getElementById('rememberMeCheckbox').checked = true;
  }

  hideSpinner(); // 🔥 Hide loading spinner after everything done
});
