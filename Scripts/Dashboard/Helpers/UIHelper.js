import {UIConfig} from "../Config/UIConfig.js";
import {ActionManager} from "../Core/ActionManager.js";
import {MessageHandlers} from "./MessageHandlers.js";
import {StateManager} from "../Services/StateManager.js";

export class UIHelper {
    /**
     * Binds dashboard action and utility button handlers.
     * @param {StateManager} stateManager
     */
    static createButtons(stateManager) {
        let actionButtons, closeButton, editButton;

        actionButtons = document.querySelectorAll(
            "#buyButtons .buyButton, #sellButtons .sellButton",
        );
        closeButton = document.getElementById("Close");
        editButton = document.getElementById("editPresets");

        for (const button of actionButtons) {
            button.addEventListener("click", () =>
                ActionManager.handleActions(button, stateManager),
            );
        }
        closeButton.addEventListener("click", () => {
            MessageHandlers.requestHideApp();
        });

        editButton.addEventListener("click", () => {
            ActionManager.toggleEditMode(stateManager);
        });
    }

    /**
     * Registers storage event listener for UI updates.
     * @param {StateManager} stateManager
     */
    static createStorageEvents(stateManager) {
        let storageChangeListener =
            UIConfig.createStorageMessageListener(stateManager);

        // Remove existing listeners before adding new ones to prevent duplicates
        if (storageChangeListener)
            chrome.storage.onChanged.removeListener(storageChangeListener);

        chrome.storage.onChanged.addListener(storageChangeListener);
    }

    /**
     * Registers runtime message listener for dashboard events.
     * @param {StateManager} stateManager
     */
    static createRuntimeEvents(stateManager) {
        let runtimeMessageListener =
            UIConfig.createRuntimeMessageListener(stateManager);

        // Remove existing listeners before adding new ones to prevent duplicates
        if (runtimeMessageListener) {
            chrome.runtime.onMessage.removeListener(runtimeMessageListener);
        }

        chrome.runtime.onMessage.addListener(runtimeMessageListener);
    }

    /**
     * Disables and hides all trade buttons.
     */
    static disableAllTradeButtons() {
        const allButtons = document.querySelectorAll(
            "#buyButtons .buyButton, #sellButtons .sellButton",
        );
        allButtons.forEach((btn) => {
            btn.disabled = true;
            btn.classList.add("hidden");
        });
    }

    /**
     * Enables and shows all trade buttons.
     */
    static enableAllTradeButtons() {
        const allButtons = document.querySelectorAll(
            "#buyButtons .buyButton, #sellButtons .sellButton",
        );
        allButtons.forEach((btn) => {
            btn.disabled = false;
            btn.classList.remove("hidden");
        });
    }

    /**
     * Resets dashboard pnl text values.
     */
    static clearUI() {
        let boughtText = document.getElementById("boughtText");
        let soldText = document.getElementById("soldText");
        let holdText = document.getElementById("holdText");
        let pnlText = document.getElementById("pnlText");

        boughtText.innerText = "0.0";
        soldText.innerText = "0.0";
        holdText.innerText = "0.0";
        pnlText.innerText = "+0.0 (0.00%)";
    }
}
