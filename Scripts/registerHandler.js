import { showSpinner, hideSpinner } from './spinner.js'; // 🔥 loading
import { showNotification } from './notificationSystem.js'; // 🔥 notification

export async function handleRegister() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const registerButton = document.getElementById('registerButton');

  if (!username || !password) {
    showNotification('Please fill in both fields.', 'error');
    return;
  }

  showSpinner();
  registerButton.disabled = true; // 🔥 Disable register button
  registerButton.style.opacity = '0.6';
  registerButton.style.cursor = 'not-allowed';

  await new Promise(resolve => setTimeout(resolve, 600)); // 600ms small delay

  try {
    const response = await fetch('http://localhost:3000/api/create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (response.ok) {
      showNotification('Account created successfully!', 'success');
      localStorage.setItem('loggedInUsername', username);
      localStorage.setItem('sessionToken', result.token);
      showNotification('You can now attempt to login.', 'success');
      hideSpinner();
    } else {
      showNotification(result.message || 'Registration failed.', 'error');
    }
  } catch (error) {
    hideSpinner();
    registerButton.disabled = false; // 🔥 Re-enable
    registerButton.style.opacity = '1';
    registerButton.style.cursor = 'pointer';

    showNotification('Server Error', 'error');
    console.error('Register error:', error);
  }
  hideSpinner();
  registerButton.disabled = false; // 🔥 Re-enable
  registerButton.style.opacity = '1';
  registerButton.style.cursor = 'pointer';


}
