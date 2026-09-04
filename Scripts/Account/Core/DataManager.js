import {DataAPI} from "../Helpers/DataAPI.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {ChromeHandler} from "../../ChromeHandler.js";

export class DataManager {
    /**
     * @param {StateManager} stateManager - Contains session and user variables.
     */
    constructor(stateManager) {
        this.dataAPI = new DataAPI();
        this.api = stateManager.api;
    }

    /**
     * @returns {Promise<Object>} - Fetches account data and updates variables.
     * */
    async fetchAccountData() {
        try {
            return await this.dataAPI.getAccData(this.api);
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
            const resetsRemaining = await this.dataAPI.resetAccount(
                this.api,
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
        return await this.dataAPI.checkSession(
            this.api
        );
    }

    async getTradeLog() {
        try {
            return await this.dataAPI.getTradeLog(this.api);
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    async getWebsocketLimits() {
        try {
            return await this.dataAPI.getWebsocketLimits(this.api)
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }
}
