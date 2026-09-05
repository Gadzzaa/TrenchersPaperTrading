import {SubscriptionAPI} from "../Helpers/SubscriptionAPI.js";

export class SubscriptionManager {
    /**
     * @param {StateManager} stateManager - Contains session and user variables.
     */
    constructor(stateManager) {
        this.subscriptionAPI = new SubscriptionAPI();
        this.api = stateManager.api;
    }

    /**
     * Creates URL to upgrade subscription and opens it in a new tab.
     * @param {string} type - "monthly" or "yearly".
     */
    async upgradeSubscription(type) {
        const response = await this.subscriptionAPI.upgradeSubscription(
            type,
            this.api
        );

        const url = response.url;
        await chrome.tabs.create({url});
    }

    /**
     * Creates URL to manage subscription and opens it in a new tab.
     * */
    async manageSubscription() {
        const response = await this.subscriptionAPI.manageSubscription(
            this.api
        );
        const url = response.url;
        await chrome.tabs.create({url});
    }
}
