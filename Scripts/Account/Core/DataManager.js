import {DataAPI} from "../Helpers/DataAPI.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {ChromeHandler} from "../../ChromeHandler.js";

export class DataManager {
    /**
     * @param {Variables} variables - Contains session and user variables.
     */
    constructor(variables) {
        this.api = new DataAPI();
        this.variables = variables;
    }

    /**
     * @returns {Promise<Object>} - Fetches account data and updates variables.
     * */
    async fetchAccountData() {
        try {
            return await this.api.getAccData(this.variables.getAuthToken());
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    /**
     * @param {number} balance - Balance to reset the account to.
     * @returns {Promise<{success: boolean, resetsRemaining: number}>} - Resets the account and returns resets left.
     */
    async resetAccount(balance) {
        try {
            const resetsRemaining = await this.api.resetAccount(
                this.variables.getAuthToken(),
                balance,
            );

            ChromeHandler.sendMessage("clearPositions")
            ChromeHandler.sendMessage("updateBalanceUI")

            return {success: true, resetsRemaining};
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    async checkSession() {
        return await this.api.checkSession(
            this.variables.getAuthToken()?.toString(),
        );
    }

    async getTradeLog() {
        try {
            return await this.api.getTradeLog(this.variables.getAuthToken());
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }
}
