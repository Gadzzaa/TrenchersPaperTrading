import {DialogsValidators} from "./DialogsValidators.js";

export class LoginUILogic {
    static async login(stateManager) {
        const {username, password} = this.#getCredentials();

        await stateManager.api.login(username, password);
        return true;
    }

    static async register(stateManager) {
        const amount = await DialogsValidators.askStartupBalance(stateManager);
        if (!amount) return false;

        const agreedToTOS = await DialogsValidators.askTOSAgreement(stateManager);
        if (!agreedToTOS) return false;

        const {username, password} = this.#getCredentials();

        await stateManager.api.register(username, password, amount);
        return true;
    }

    static togglePasswordVisibility(button) {
        const icon = button.querySelector("i");
        const passwordInput = document.getElementById("formPassword");

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

    static #getCredentials() {
        const usernameInput = document.getElementById("formUsername");
        const passwordInput = document.getElementById("formPassword");

        return {
            username: usernameInput.value,
            password: passwordInput.value,
        };
    }
}
