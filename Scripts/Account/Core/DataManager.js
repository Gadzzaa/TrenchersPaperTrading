import {DataAPI} from "../Helpers/DataAPI.js";
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
    fetchAccountData() {
        return this.dataAPI.getAccData(this.api);
    }

    /**
     * @param {number} balance - Balance to reset the account to.
     * @returns {Promise<{success: boolean, resetsRemaining: number}>} - Resets the account and returns resets left.
     */
    async resetAccount(balance) {
        const resetsRemaining = await this.dataAPI.resetAccount(
            this.api,
            balance,
        );

        ChromeHandler.sendMessage("clearPositions");
        ChromeHandler.sendMessage("updateBalanceUI");

        return {success: true, resetsRemaining};
    }

    checkSession() {
        return this.dataAPI.checkSession(this.api);
    }

    getTradeLog() {
        return this.dataAPI.getTradeLog(this.api);
    }

    getWebsocketLimits() {
        return this.dataAPI.getWebsocketLimits(this.api);
    }
}
