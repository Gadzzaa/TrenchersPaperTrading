import {UIConfig} from "../Config/UIConfig.js";
import {ActionManager} from "../Core/ActionManager.js";
import {MessageHandlers} from "./MessageHandlers.js";
import {StateManager} from "../Services/StateManager.js";

export class UIHelper {
    /**
     *
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
        chrome.storage.onChanged.addListener(
            UIConfig.createStorageMessageListener(
                stateManager
            )
        );
    }

    /**
     * Registers runtime message listener for dashboard events.
     * @param {StateManager} stateManager
     */
    static createRuntimeEvents(stateManager) {
        chrome.runtime.onMessage.addListener(
            UIConfig.createRuntimeMessageListener(
                stateManager
            )
        );
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
