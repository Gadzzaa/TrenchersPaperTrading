import {AccountUILogic} from "../Helpers/AccountUILogic.js";
import {LoadingUIHelper} from "../../Utils/Helpers/LoadingUIHelper.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {isNoSessionError} from "../../Server/AuthErrorHelper.js";

export class AccountUIManager {
    static createButtons(stateManager) {
        const resetButton = document.getElementById("resetButton");
        const upgradeButton = document.getElementById("upgradeButton");
        const monthlyButton = document.getElementById("monthlyButton");
        const yearlyButton = document.getElementById("yearlyButton");
        const manageButton = document.getElementById("manageButton");
        const closeSubscriptionButton = document.getElementById("closeSubscriptionButton");

        resetButton.addEventListener("click", () => {
            void AccountUIManager.#runButtonAction(
                resetButton,
                stateManager,
                () => AccountUILogic.resetAccount(stateManager),
            );
        });

        upgradeButton.addEventListener("click", () => {
            AccountUILogic.showSubscriptionDiv();
        });

        monthlyButton.addEventListener("click", () => {
            void AccountUIManager.#runButtonAction(
                monthlyButton,
                stateManager,
                () => AccountUILogic.upgradeSubscription("monthly", stateManager),
            )
        });

        yearlyButton.addEventListener("click", () => {
            void AccountUIManager.#runButtonAction(
                yearlyButton,
                stateManager,
                () => AccountUILogic.upgradeSubscription("yearly", stateManager),
            )
        });

        manageButton.addEventListener("click", () => {
            void AccountUIManager.#runButtonAction(
                manageButton,
                stateManager,
                () => AccountUILogic.manageSubscription(stateManager),
            )
        });

        closeSubscriptionButton.addEventListener("click", () => {
            AccountUILogic.hideSubscriptionDiv();
        })
    }

    /**
     * @param {HTMLButtonElement} button
     * @param {StateManager} stateManager
     * @param {() => Promise<void>} action
     */
    static async #runButtonAction(button, stateManager, action) {
        const loadingInterval = LoadingUIHelper.startLoadingDots(button);

        try {
            await action();
        } catch (error) {
            if (isNoSessionError(error)) return;

            ErrorHandler.show(
                error,
                {show: false},
                {show: true, stateManager},
            );
        } finally {
            LoadingUIHelper.stopLoadingDots(button, loadingInterval);
        }
    }
}
