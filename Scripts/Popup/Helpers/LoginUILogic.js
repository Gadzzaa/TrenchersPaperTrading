import {Variables} from "../../Account/Core/Variables.js";
import {AuthManager} from "../../Account/Core/AuthManager.js";
import {DialogsValidators} from "./DialogsValidators.js";

export class LoginUILogic {
    static async login(stateManager) {
        let usernameInput = document.getElementById("formUsername");
        let passwordInput = document.getElementById("formPassword");

        stateManager.variables = new Variables({
            username: usernameInput.value,
        });
        let authManager = new AuthManager(stateManager.variables);

        await authManager.login(passwordInput.value);
    }

    static async register(stateManager) {
        let usernameInput = document.getElementById("formUsername");
        let passwordInput = document.getElementById("formPassword");

        let amount = await DialogsValidators.askStartupBalance(stateManager);
        if (!amount) return;

        let agreedToTOS = await DialogsValidators.askTOSAgreement(stateManager);
        if (!agreedToTOS) return;

        stateManager.variables = new Variables({
            username: usernameInput.value,
            balance: amount,
        });
        let authManager = new AuthManager(stateManager.variables);

        await authManager.register(passwordInput.value);
    }

    static async logout(stateManager) {
        let authManager = new AuthManager(stateManager.variables);

        await authManager.logout();
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
