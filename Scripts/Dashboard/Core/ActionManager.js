import {UIHelper} from "../Helpers/UIHelper.js";
import {UIHelper as GlobalUIHelper} from "../../Utils/Helpers/UIHelper.js";
import {updateBalanceUI} from "../Helpers/BalanceUpdater.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {ActionHelper} from "../Helpers/ActionHelper.js";
import {EditHelper} from "../Helpers/EditHelper.js";
import {PresetManager} from "./PresetManager.js";
import {StateManager} from "../Services/StateManager.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class ActionManager {
    /**
     * Routes trade button actions based on current edit mode.
     * @param {HTMLButtonElement} button
     * @param {StateManager} stateManager
     */
    static async handleActions(button, stateManager) {
        try {
            if (document.body.classList.contains("edit-mode")) {
                ActionManager.#handleEditActions(button, stateManager);
            } else await ActionManager.#handleBasicActions(button, stateManager);
        } catch (error) {
            ErrorHandler.show(error);
        }
    }

    /**
     * Toggles preset edit mode UI state.
     * @param {StateManager} stateManager
     */
    static toggleEditMode(stateManager) {
        if (document.body.classList.contains("edit-mode")) {
            EditHelper.activateEditMode(stateManager);
        } else {
            EditHelper.deactivateEditMode();
        }
    }

    /**
     * Executes buy/sell actions in normal mode.
     * @param {HTMLButtonElement} button
     * @param {StateManager} stateManager
     * @returns {Promise<void>}
     */
    static async #handleBasicActions(button, stateManager) {
        let ws = stateManager.pnlService?.wsManager?.ws;
        if (!ws || ws.readyState !== WebSocket.OPEN)
            throw new AppError("WebSocket is not connected.", {
                code: "WS_NOT_CONNECTED",
                meta: {
                    ws
                }
            })

        UIHelper.disableAllTradeButtons();
        let loadingDotsInterval = GlobalUIHelper.startLoadingDots(button)

        let Constants = {
            transactionManager: null,
            poolAddress: null,
            action: null,
            dataAmount: null,
            button: button,
        };

        ActionHelper.loadAndValidateBasicConstants(Constants, stateManager);

        if (Constants.action === "buy")
            await ActionHelper.handleBuy(
                Constants.transactionManager,
                Constants.poolAddress,
                stateManager,
            );
        if (Constants.action === "sell")
            await ActionHelper.handleSell(Constants.transactionManager, stateManager);

        await updateBalanceUI(true, stateManager);
        GlobalUIHelper.stopLoadingDots(button, loadingDotsInterval);
        UIHelper.enableAllTradeButtons();
    }

    /**
     * Handles preset label/amount edits in edit mode.
     * @param {HTMLButtonElement} button
     * @param {StateManager} stateManager
     */
    static #handleEditActions(button, stateManager) {
        let activePreset = stateManager.currentPreset;
        let presets = JSON.parse(PresetManager.getPresets());

        let action = button.dataset.action;
        let amount = prompt(
            `Enter new ${action.toUpperCase()} label:`,
            button.dataset.amount,
        );
        if (amount?.trim() === "") throw new Error("Invalid input.");

        if (action === "buy") {
            amount = parseFloat(amount).toFixed(2);
            button.textContent = `${amount}`;
            button.dataset.amount = amount;

            EditHelper.editBuyPresets({presets, activePreset}, {button, amount});
        } else {
            amount = Number(amount);
            button.textContent = `${amount} %`;
            button.dataset.amount = amount.toFixed(0);

            EditHelper.editSellPresets({presets, activePreset}, {button, amount});
        }

        PresetManager.setPresets(presets);
    }
}
