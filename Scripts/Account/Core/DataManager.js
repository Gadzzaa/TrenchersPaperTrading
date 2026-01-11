import { handleError } from "../../utils.js";
import { DataAPI } from "../Helpers/DataAPI.js";

export class DataManager {
  /**
   * @param {Variables} variables - Contains session and user variables.
   */
  constructor(variables) {
    this.api = new DataAPI();
    this.variables = variables;
  }

  /**
   * @returns {Promise<void>} - Fetches account data and updates variables.
   * */
  async fetchAccountData() {
    try {
      return await this.api.getAccData(this.variables.getSessionToken());
    } catch (error) {
      handleError(error, "Could not fetch popup data: ");
      throw error;
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

      chrome.runtime.sendMessage({ type: "clearPositions" });
      chrome.runtime.sendMessage({ type: "updateBalanceUI" });

      return { success: true, resetsRemaining: response.resetsLeft };
    } catch (error) {
      handleError(error, "Could not reset account: ");
      throw error;
    }
  }

  async checkSession() {
    try {
      console.log("Checking session: ", this.variables.getSessionToken());
      const response = await this.api.checkSession(
        this.variables.getSessionToken().toString(),
      );

      return response;
    } catch (error) {
      handleError(error, "Could not validate session: ", { sound: false });
      return false;
    }
  }

  async getTradeLog() {
    try {
      return await this.api.getTradeLog(this.variables.getSessionToken());
    } catch (e) {
      console.warn("Could not fetch trade log: ", e);
    }
  }
}
