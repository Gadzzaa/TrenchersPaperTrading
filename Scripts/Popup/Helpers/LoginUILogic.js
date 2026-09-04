import {DialogsValidators} from "./DialogsValidators.js";

export class LoginUILogic {
    static async login(stateManager) {
        let usernameInput = document.getElementById("formUsername");
        let passwordInput = document.getElementById("formPassword");

        await stateManager.api.login(usernameInput.value, passwordInput.value);
        return true
    }

    static async register(stateManager) {
        let usernameInput = document.getElementById("formUsername");
        let passwordInput = document.getElementById("formPassword");

        let amount = await DialogsValidators.askStartupBalance(stateManager);
        if (!amount) return false;

        let agreedToTOS = await DialogsValidators.askTOSAgreement(stateManager);
        if (!agreedToTOS) return false;

        await stateManager.api.register(usernameInput.value, passwordInput.value, amount);
        return true
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
