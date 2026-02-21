import { LoginUILogic } from "../Helpers/LoginUILogic.js";

export class LoginUIManager {
  static createButtons(stateManager) {
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const logoutButton = document.getElementById("logoutButton");
    const showPassButton = document.getElementById("showPasswordButton");

    loginButton.addEventListener("click", async () => {
      LoginUILogic.login(stateManager);
    });
    registerButton.addEventListener("click", async () => {
      LoginUILogic.register(stateManager);
    });
    logoutButton.addEventListener("click", async () => {
      LoginUILogic.logout(stateManager);
    });
    showPassButton.addEventListener("click", () => {
      LoginUILogic.togglePasswordVisibility(showPassButton);
    });
  }
}
