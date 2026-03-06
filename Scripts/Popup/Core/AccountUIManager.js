import {AccountUILogic} from "../Helpers/AccountUILogic.js";
import {UIHelper as GlobalUIHelper} from "../../Utils/Helpers/UIHelper.js";

export class AccountUIManager {
    static createButtons(stateManager) {
        const resetButton = document.getElementById("resetButton");
        const upgradeButton = document.getElementById("upgradeButton");
        const monthlyButton = document.getElementById("monthlyButton");
        const yearlyButton = document.getElementById("yearlyButton");
        const manageButton = document.getElementById("manageButton");
        const closeSubscriptionButton = document.getElementById("closeSubscriptionButton");

        resetButton.addEventListener("click", async () => {
            let resetButtonInterval = GlobalUIHelper.startLoadingDots(resetButton);
            await AccountUILogic.resetAccount(stateManager);
            GlobalUIHelper.stopLoadingDots(resetButton, resetButtonInterval);
        });
        upgradeButton.addEventListener("click", () => {
            AccountUILogic.showSubscriptionDiv();
        });
        monthlyButton.addEventListener("click", async () => {
            let monthlyButtonInterval = GlobalUIHelper.startLoadingDots(monthlyButton);
            await AccountUILogic.upgradeSubscription("monthly", stateManager);
            GlobalUIHelper.stopLoadingDots(monthlyButton, monthlyButtonInterval);
        });
        yearlyButton.addEventListener("click", async () => {
            let yearlyButtonInterval = GlobalUIHelper.startLoadingDots(yearlyButton);
            await AccountUILogic.upgradeSubscription("yearly", stateManager);
            GlobalUIHelper.stopLoadingDots(yearlyButton, yearlyButtonInterval);
        });
        manageButton.addEventListener("click", async () => {
            let manageButtonInterval = GlobalUIHelper.startLoadingDots(manageButton);
            await AccountUILogic.manageSubscription(stateManager);
            GlobalUIHelper.stopLoadingDots(manageButton, manageButtonInterval);
        });
        closeSubscriptionButton.addEventListener("click", async () => {
            AccountUILogic.hideSubscriptionDiv();
        })
    }
}
