import { ErrorHandler } from "../../ErrorHandling/Core/ErrorHandler.js";
import { SubscriptionManager } from "../../Account/Core/SubscriptionManager.js";
import { DataManager } from "../../Data/Core/DataManager.js";
import { FooterHelper } from "./FooterHelper.js";

export class AccountUILogic {
  static async resetAccount(stateManager) {
    let amount = DialogsValidators.askStartupBalance();
    if (!amount) return;

    let confirmed = DialogsValidators.askResetConfirmation();
    if (!confirmed) return;

    // TODO: startLoadingDots
    let dataManager = new DataManager(stateManager.variables);

    await dataManager
      .resetAccount(amount)
      .then(() => {
        FooterHelper.focusDefaultButton();
      })
      .catch((err) => {
        throw ErrorHandler.log(err);
      });
  }

  static showSubscriptionDiv() {
    const subDiv = document.getElementById("SubscriptionSelectorDiv");
    subDiv.classList.remove("hidden");
    subDiv.style.opacity = "1";
  }

  static async upgradeSubscription(plan, stateManager) {
    // TODO: startLoadingDots
    let subscriptionManager = new SubscriptionManager(stateManager.variables);
    await subscriptionManager
      .upgradeSubscription(plan)
      .catch((err) => {
        throw ErrorHandler.log(err);
      })
      .finally(() => {
        hideSubscriptionDiv();
      });
  }

  static async manageSubscription(stateManager) {
    // TODO: startLoadingDots
    let subscriptionManager = new SubscriptionManager(stateManager.variables);
    await subscriptionManager.manageSubscription().catch((err) => {
      throw ErrorHandler.log(err);
    });
  }
}
