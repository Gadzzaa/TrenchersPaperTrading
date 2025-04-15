import { generateRandomUsername, generateRandomPassword } from './randomUserPass.js';
import { login, createAccount } from './api.js';

document.addEventListener("DOMContentLoaded", function() {
  console.log("The DOM has been loaded and is ready to be manipulated.");
  const loginButton = document.getElementById("loginButton");
  const createAccountButton = document.getElementById("registerButton");

  loginButton.addEventListener("click", function() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    login({ username, password })
      .then(response => {
        console.log("Login successful:", response);
      })
      .catch(error => {
        console.error("Login failed:", error);
      });
  });
  createAccountButton.addEventListener("click", function() {

    const username = generateRandomUsername();
    const password = generateRandomPassword();
    createAccount({ username, password })
      .then(response => {
        console.log("Account creation successful:", response);
      })
      .catch(error => {
        console.error("Account creation failed:", error);
      });
    alert(`Account created successfully. Username: ${username}, Password: ${password}`);
  });

});
