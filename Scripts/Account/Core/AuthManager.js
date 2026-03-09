import {StorageManager} from "../../Utils/Core/StorageManager.js";
import {UIManager} from "../../Utils/Core/UIManager.js";
import {AuthAPI} from "../Helpers/AuthAPI.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {ChromeHandler} from "../../ChromeHandler.js";

export class AuthManager {
    /**
     * @param {Variables} variables - Contains session and user variables.
     */
    constructor(variables) {
        this.api = new AuthAPI();
        this.variables = variables;
    }

    /**
     * Logs in the user with provided credentials.
     * @param {string} password - The user's password for authentication.
     * */
    async login(password) {
        try {
            const sessionToken = await this.api.login(
                this.variables.getCredentials().username,
                password
            );

            await StorageManager.setToStorage("sessionToken", sessionToken);
            this.variables.setSessionToken(sessionToken);

            ChromeHandler.sendMessage("initDashboard");
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    /**
     * Registers a new user with provided credentials and initial balance.
     * */
    async register(password) {
        try {
            const sessionToken = await this.api.register(
                this.variables.getCredentials().username,
                password,
                this.variables.getBalance(),
            );

            await StorageManager.setToStorage("sessionToken", sessionToken);
            this.variables.setSessionToken(sessionToken);

            ChromeHandler.sendMessage("initDashboard");
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    /**
     *  Logs out the current user.
     * */
    async logout() {
        try {
            await this.api.logout(this.variables.getSessionToken());

            await StorageManager.removeFromStorage("sessionToken");
            this.variables.setSessionToken(null);

            ChromeHandler.sendMessage("logoutDashboard");

            await UIManager.disableUI("no-session");
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }
}
