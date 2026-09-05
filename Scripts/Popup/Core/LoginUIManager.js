import {LoginUILogic} from "../Helpers/LoginUILogic.js";
import {FooterHelper} from "../Helpers/FooterHelper.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {AccountLoader} from "./AccountLoader.js";
import {LoadingUIHelper} from "../../Utils/Helpers/LoadingUIHelper.js"
import {ChromeHandler} from "../../ChromeHandler.js";

export class LoginUIManager {
    static createButtons(stateManager) {
        const loginButton = document.getElementById("loginButton");
        const registerButton = document.getElementById("registerButton");
        const logoutButton = document.getElementById("logoutButton");
        const showPassButton = document.getElementById("showPasswordButton");

        loginButton.addEventListener("click", () => {
            LoginUIManager.#runSessionAction(
                loginButton,
                stateManager,
                () => LoginUILogic.login(stateManager)
            )
        });
        registerButton.addEventListener("click", () => {
            LoginUIManager.#runSessionAction(
                registerButton,
                stateManager,
                () => LoginUILogic.register(stateManager)
            )
        });
        logoutButton.addEventListener("click", async () => {
            const logoutInterval = LoadingUIHelper.startLoadingDots(logoutButton);
            try {
                await stateManager.api.logout();
                stateManager.clearUI();
                FooterHelper.focusDefaultButton();
            } catch (err) {
                ErrorHandler.show(err, {show: false}, {show: true, stateManager});
            } finally {
                LoadingUIHelper.stopLoadingDots(logoutButton, logoutInterval);
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

    /**
     * @param {HTMLButtonElement} button
     * @param {StateManager} stateManager
     * @param {() => Promise<boolean>} action
     */
    static async #runSessionAction(button, stateManager, action) {
        const loadingInterval =
            LoadingUIHelper.startLoadingDots(button);

        try {
            const sessionEstablished = await action();

            if (!sessionEstablished) return;

            await AccountLoader.loadData(stateManager);
            FooterHelper.focusDefaultButton();

            await ChromeHandler.sendMessageAsync("SESSION_VALID", {
                workerRevision: stateManager.api.getWorkerRevision(),
            });
        } catch (error) {
            ErrorHandler.show(error, {show: false}, {show: true, stateManager}
            );
        } finally {
            LoginUIManager.clearInputs();
            LoadingUIHelper.stopLoadingDots(button, loadingInterval);
        }
    }


}
