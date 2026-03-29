import {LoginUILogic} from "../Helpers/LoginUILogic.js";
import {FooterHelper} from "../Helpers/FooterHelper.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {AccountLoader} from "./AccountLoader.js";
import {UIHelper as GlobalUIHelper} from "../../Utils/Helpers/UIHelper.js"
import {ChromeHandler} from "../../ChromeHandler.js";

export class LoginUIManager {
    static createButtons(stateManager) {
        const loginButton = document.getElementById("loginButton");
        const registerButton = document.getElementById("registerButton");
        const logoutButton = document.getElementById("logoutButton");
        const showPassButton = document.getElementById("showPasswordButton");

        loginButton.addEventListener("click", async () => {
            const loginInterval = GlobalUIHelper.startLoadingDots(loginButton);
            try {
                await LoginUILogic.login(stateManager);
                await AccountLoader.loadData(stateManager)
                FooterHelper.focusDefaultButton();
                await ChromeHandler.sendMessageAsync("SESSION_VALID");
            } catch (err) {
                throw ErrorHandler.log(err);
            } finally {
                LoginUIManager.clearInputs();
                GlobalUIHelper.stopLoadingDots(loginButton, loginInterval)
            }
        });
        registerButton.addEventListener("click", async () => {
            const registerInterval = GlobalUIHelper.startLoadingDots(registerButton);
            try {
                await LoginUILogic.register(stateManager);
                await AccountLoader.loadData(stateManager);
                FooterHelper.focusDefaultButton();
                await ChromeHandler.sendMessageAsync("SESSION_VALID");
            } catch (err) {
                throw ErrorHandler.log(err);
            } finally {
                LoginUIManager.clearInputs();
                GlobalUIHelper.stopLoadingDots(registerButton, registerInterval)
            }
        });
        logoutButton.addEventListener("click", async () => {
            const logoutInterval = GlobalUIHelper.startLoadingDots(logoutButton);
            try {
                await LoginUILogic.logout(stateManager);
                stateManager.clearUI();
                FooterHelper.focusDefaultButton();
                await ChromeHandler.sendMessageAsync("NO_SESSION");
            } catch (err) {
                throw ErrorHandler.log(err);
            } finally {
                GlobalUIHelper.stopLoadingDots(logoutButton, logoutInterval);
            }
        });
        showPassButton.addEventListener("click", () => {
            LoginUILogic.togglePasswordVisibility(showPassButton);
        });
    }

    static clearInputs() {
        const usernameInput = document.getElementById("formUsername");
        const passwordInput = document.getElementById("formPassword");

        usernameInput.value = "";
        passwordInput.value = "";
    }


}
