import {StorageManager} from "../../Utils/Core/StorageManager.js";
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
            const authToken = await this.api.login(
                this.variables.getCredentials().username,
                password
            );

            this.variables.setAuthToken(authToken);
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    /**
     * Registers a new user with provided credentials and initial balance.
     * */
    async register(password) {
        try {
            const authToken = await this.api.register(
                this.variables.getCredentials().username,
                password,
                this.variables.getBalance(),
            );

            this.variables.setAuthToken(authToken);
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    /**
     *  Logs out the current user.
     * */
    async logout() {
        try {
            await this.api.logout(this.variables.getAuthToken());

            this.variables.setAuthToken(null);
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }
}
