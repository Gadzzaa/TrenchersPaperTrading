import { handleLogin } from './loginHandler.js';
import { handleRegister } from './registerHandler.js';
import { showSpinner, hideSpinner } from './spinner.js'; // 🔥 loading
import { checkSession } from './sessionChecker.js'; // 🔥 session

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('loginButton').addEventListener('click', handleLogin);
  document.getElementById('registerButton').addEventListener('click', handleRegister);
  const sessionToken = localStorage.getItem('sessionToken');
  const rememberedUsername = localStorage.getItem('rememberedUsername');

  if (sessionToken) {
    try {
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
    } catch (error) {
      console.error('Error checking session:', error);
      // Handle the error as needed
    }
  }

  // If we get here, session was invalid or missing
  if (rememberedUsername) {
    document.getElementById('username').value = rememberedUsername;
    document.getElementById('rememberMeCheckbox').checked = true;
  }
});
