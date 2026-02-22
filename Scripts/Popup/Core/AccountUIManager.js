import { AccountUILogic } from "../Helpers/AccountUILogic.js";
export class AccountUIManager {
  static createButtons(stateManager) {
    const resetButton = document.getElementById("resetButton");
    const upgradeButton = document.getElementById("upgradeButton");
    const monthlyButton = document.getElementById("monthlyButton");
    const yearlyButton = document.getElementById("yearlyButton");
    const manageButton = document.getElementById("manageButton");

    resetButton.addEventListener("click", async () => {
      AccountUILogic.resetAccount(stateManager);
    });
    upgradeButton.addEventListener("click", () => {
      AccountUILogic.showSubscriptionDiv();
    });
    monthlyButton.addEventListener("click", async () => {
      AccountUILogic.upgradeSubscription("monthly", stateManager);
    });
    yearlyButton.addEventListener("click", async () => {
      AccountUILogic.upgradeSubscription("yearly", stateManager);
    });
    manageButton.addEventListener("click", async () => {
      AccountUILogic.manageSubscription(stateManager);
    });
  }
}
