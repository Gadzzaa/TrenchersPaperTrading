import { handleLogin } from './loginHandler.js';
import { handleRegister } from './registerHandler.js';
document.getElementById('loginButton').addEventListener('click', handleLogin);
document.getElementById('registerButton').addEventListener('click', handleRegister);

window.addEventListener('DOMContentLoaded', () => {
  const rememberedUsername = localStorage.getItem('rememberedUsername');
  if (rememberedUsername) {
    document.getElementById('username').value = rememberedUsername;
    document.getElementById('rememberMeCheckbox').checked = true;
  }
});
