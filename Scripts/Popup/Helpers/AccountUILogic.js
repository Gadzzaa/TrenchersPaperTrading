import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {SubscriptionManager} from "../../Account/Core/SubscriptionManager.js";
import {DataManager} from "../../Account/Core/DataManager.js"
import {FooterHelper} from "./FooterHelper.js";
import {DialogsValidators} from "./DialogsValidators.js";
import {AccountLoader} from "../Core/AccountLoader.js";

export class AccountUILogic {
    static async resetAccount(stateManager) {
        let amount = await DialogsValidators.askStartupBalance();
        if (!amount) return;

        let confirmed = await DialogsValidators.askResetConfirmation();
        if (!confirmed) return;

        let dataManager = new DataManager(stateManager.variables);

        await dataManager
            .resetAccount(amount)
            .then(() => {
                FooterHelper.focusDefaultButton();
                AccountLoader.loadData(stateManager);
            })
            .catch((err) => {
                throw ErrorHandler.log(err);
            });
    }


    static async upgradeSubscription(plan, stateManager) {
        let subscriptionManager = new SubscriptionManager(stateManager.variables);
        await subscriptionManager
            .upgradeSubscription(plan)
            .catch((err) => {
                throw ErrorHandler.log(err);
            })
            .finally(() => {
                AccountUILogic.hideSubscriptionDiv();
            });
    }

    static async manageSubscription(stateManager) {
        let subscriptionManager = new SubscriptionManager(stateManager.variables);
        await subscriptionManager.manageSubscription().catch((err) => {
            throw ErrorHandler.log(err);
        }).finally
        (() => {
            AccountUILogic.hideSubscriptionDiv();
        });
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
