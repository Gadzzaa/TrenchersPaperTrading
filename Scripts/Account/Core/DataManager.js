import {DataAPI} from "../Helpers/DataAPI.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";

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
            return await this.api.getAccData(this.variables.getSessionToken());
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
            const response = await this.api.resetAccount(
                this.variables.getSessionToken(),
                balance,
            );

            chrome.runtime.sendMessage({type: "clearPositions"});
            chrome.runtime.sendMessage({type: "updateBalanceUI"});

            return {success: true, resetsRemaining: response.resetsLeft};
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    async checkSession() {
        console.log("Checking session: ", this.variables.getSessionToken());
        return await this.api.checkSession(
            this.variables.getSessionToken().toString(),
        );
    }

    async getTradeLog() {
        try {
            return await this.api.getTradeLog(this.variables.getSessionToken());
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }
}
