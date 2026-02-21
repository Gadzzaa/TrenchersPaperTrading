import { Variables } from "../../Account/Core/Variables.js";
import { AuthManager } from "../../Account/Core/AuthManager.js";
import { DialogsValidators } from "./DialogsValidators.js";
import { FooterHelper } from "./FooterHelper.js";

export class LoginUILogic {
  static async login(stateManager) {
    // TODO: startLoadingDots
    stateManager.variables = new Variables({
      username: usernameInput.value,
      password: passwordInput.value,
    });
    let authManager = new AuthManager(stateManager.variables);

    await authManager
      .login()
      .then(() => {
        // TODO: clearInputFields and init
        FooterHelper.focusDefaultButton();
      })
      .catch((err) => {
        throw ErrorHandler.log(err);
      });
  }

  static async register(stateManager) {
    let amount = DialogsValidators.askStartupBalance();
    if (!amount) return;

    let agreedToTOS = DialogsValidators.askTOSAgreement();
    if (!agreedToTOS) return;

    // TODO: startLoadingDots
    stateManager.variables = new Variables({
      username: usernameInput.value,
      password: passwordInput.value,
      balance: amount,
    });
    let authManager = new AuthManager(stateManager.variables);

    await authManager
      .register()
      .then(() => {
        // TODO: clearInputFields and init
        FooterHelper.focusDefaultButton();
      })
      .catch((err) => {
        throw ErrorHandler.log(err);
      });
  }

  static async logout(stateManager) {
    //TODO: startLoadingDots(logoutButton, interval);
    let authManager = new AuthManager(stateManager.variables);

    await authManager
      .logout()
      .then(() => {
        //TODO: disconnectPopup
        FooterHelper.focusDefaultButton();
      })
      .catch((err) => {
        throw ErrorHandler.log(err);
      });
  }

  static togglePasswordVisibility(button) {
    const icon = button.querySelector("i");
    let passwordInput = document.getElementById("formPassword");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  }
}
