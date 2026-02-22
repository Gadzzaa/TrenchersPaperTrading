import {LoginUILogic} from "../Helpers/LoginUILogic.js";
import {FooterHelper} from "../Helpers/FooterHelper";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler";

export class LoginUIManager {
    static createButtons(stateManager) {
        const loginButton = document.getElementById("loginButton");
        const registerButton = document.getElementById("registerButton");
        const logoutButton = document.getElementById("logoutButton");
        const showPassButton = document.getElementById("showPasswordButton");

        loginButton.addEventListener("click", async () => {
            LoginUILogic.login(stateManager).then(() => {
                //todo: loadAccountData
                FooterHelper.focusDefaultButton();
            }).catch((err) => {
                throw ErrorHandler.log(err);
            });
        });
        registerButton.addEventListener("click", async () => {
            LoginUILogic.register(stateManager).then(() => {
                //todo: loadAccountData
                FooterHelper.focusDefaultButton();
            }).catch((err) => {
                throw ErrorHandler.log(err);
            });
        });
        logoutButton.addEventListener("click", async () => {
            LoginUILogic.logout(stateManager).then(() => {
                //TODO: disconnectPopup
                FooterHelper.focusDefaultButton();
            }).catch((err) => {
                throw ErrorHandler.log(err);
            });
        });
        showPassButton.addEventListener("click", () => {
            LoginUILogic.togglePasswordVisibility(showPassButton);
        });
    }


}
