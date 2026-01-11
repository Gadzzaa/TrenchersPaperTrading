import { SubscriptionAPI } from "../Helpers/SubscriptionAPI.js";
import { handleError } from "../../utils.js";

export class SubscriptionManager {
  /**
   * @param {Variables} variables - Contains session and user variables.
   */
  constructor(variables) {
    this.api = new SubscriptionAPI();
    this.variables = variables;
  }

  /**
   * Creates URL to upgrade subscription and opens it in a new tab.
   * @param {string} type - "monthly" or "yearly".
   */
  async upgradeSubscription(type) {
    try {
      const response = await this.api.upgradeSubscription(
        type,
        this.variables.getSessionToken(),
      );

      const url = response.url;
      chrome.tabs.create({ url });
    } catch (error) {
      handleError(error, "Could not upgrade subscription: ");
      throw error;
    }
  }

  /**
   * Creates URL to manage subscription and opens it in a new tab.
   * */
  async manageSubscription() {
    try {
      const response = await this.api.manageSubscription(
        this.variables.getSessionToken(),
      );
      const url = response.url;
      chrome.tabs.create({ url });
    } catch (error) {
      handleError(error, "Could not manage subscription: ");
      throw error;
    }
  }
}
