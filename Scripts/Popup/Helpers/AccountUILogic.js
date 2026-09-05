import {SubscriptionManager} from "../../Account/Core/SubscriptionManager.js";
import {DataManager} from "../../Account/Core/DataManager.js"
import {FooterHelper} from "./FooterHelper.js";
import {DialogsValidators} from "./DialogsValidators.js";
import {AccountLoader} from "../Core/AccountLoader.js";

export class AccountUILogic {
    static async resetAccount(stateManager) {
        const amount = await DialogsValidators.askStartupBalance(stateManager);
        if (!amount) return;

        const confirmed = await DialogsValidators.askResetConfirmation(stateManager);
        if (!confirmed) return;

        const dataManager = new DataManager(stateManager);

        await dataManager.resetAccount(amount);
        FooterHelper.focusDefaultButton();
        await AccountLoader.loadData(stateManager);
    }

    static upgradeSubscription(plan, stateManager) {
        const subscriptionManager = new SubscriptionManager(stateManager);

        return AccountUILogic.#runSubscriptionOperation(
            () => subscriptionManager.upgradeSubscription(plan),
        );
    }

    static manageSubscription(stateManager) {
        const subscriptionManager = new SubscriptionManager(stateManager);

        return AccountUILogic.#runSubscriptionOperation(
            () => subscriptionManager.manageSubscription(),
        );
    }

    /**
     * @param {() => Promise<void>} operation
     * @returns {Promise<void>}
     */
    static async #runSubscriptionOperation(operation) {
        try {
            await operation();
        } finally {
            AccountUILogic.hideSubscriptionDiv();
        }
    }

    static showSubscriptionDiv() {
        const subDiv = document.getElementById("SubscriptionSelectorDiv");
        subDiv.classList.remove("hidden");
        subDiv.style.opacity = "1";
    }

    static hideSubscriptionDiv() {
        const subDiv = document.getElementById("SubscriptionSelectorDiv");
        subDiv.style.opacity = "0";
        subDiv.classList.add("hidden");
    }

}
