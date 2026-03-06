import {LoginUILogic} from "../Helpers/LoginUILogic.js";
import {FooterHelper} from "../Helpers/FooterHelper.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {AccountLoader} from "./AccountLoader.js";
import {UIManager} from "../../Utils/Core/UIManager.js";
import {UIHelper as GlobalUIHelper} from "../../Utils/Helpers/UIHelper.js"

export class LoginUIManager {
    static createButtons(stateManager) {
        const loginButton = document.getElementById("loginButton");
        const registerButton = document.getElementById("registerButton");
        const logoutButton = document.getElementById("logoutButton");
        const showPassButton = document.getElementById("showPasswordButton");

        loginButton.addEventListener("click", async () => {
            let loginInterval = GlobalUIHelper.startLoadingDots(loginButton);
            LoginUILogic.login(stateManager).then(() => {
                AccountLoader.loadData(stateManager).then(() => {
                    FooterHelper.focusDefaultButton();
                    UIManager.enableUI();
                })
            }).catch((err) => {
                throw ErrorHandler.log(err);
            }).finally(() => {
                LoginUIManager.clearInputs();
                GlobalUIHelper.stopLoadingDots(loginButton, loginInterval)
            });
        });
        registerButton.addEventListener("click", async () => {
            let registerInterval = GlobalUIHelper.startLoadingDots(registerButton);
            LoginUILogic.register(stateManager).then(() => {
                AccountLoader.loadData(stateManager).then(() => {
                    FooterHelper.focusDefaultButton();
                    UIManager.enableUI();
                });
            }).catch((err) => {
                throw ErrorHandler.log(err);
            }).finally(() => {
                LoginUIManager.clearInputs();
                GlobalUIHelper.stopLoadingDots(loginButton, registerInterval)
            });
        });
        logoutButton.addEventListener("click", async () => {
            let logoutInterval = GlobalUIHelper.startLoadingDots(logoutButton);
            LoginUILogic.logout(stateManager).then(() => {
                stateManager.clearUI();
                FooterHelper.focusDefaultButton();
                UIManager.disableUI()
            }).catch((err) => {
                throw ErrorHandler.log(err);
            }).finally(() => GlobalUIHelper.stopLoadingDots(logoutButton, logoutInterval));
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
