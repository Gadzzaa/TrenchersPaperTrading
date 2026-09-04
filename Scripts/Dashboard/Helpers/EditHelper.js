import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {StateManager} from "../Services/StateManager.js";

const PRESET_GROUPS = Object.freeze({
    buy: "buys",
    sell: "sells",
});

export class EditHelper {
    /**
     * Exits edit mode after transition.
     * @param {StateManager} stateManager
     */
    static exitEditMode(stateManager) {
        const body = document.body;
        const sellsTab = document.getElementById("Sells");

        body.classList.add("edit-mode-exit");
        if (!stateManager.pnlService.isActive()) sellsTab.classList.add("hidden");

        // Wait for animation to finish
        setTimeout(() => {
            body.classList.remove("edit-mode", "edit-mode-exit");
        }, 400);
    }

    /**
     * Enters edit mode and ensures sell tab is visible.
     */
    static enterEditMode() {
        const body = document.body;
        const sellsTab = document.getElementById("Sells");

        sellsTab.classList.remove("hidden");
        body.classList.add("edit-mode");
    }

    /**
     * @param {"buy"|"sell"} action
     * @param {{presets: Object, activePreset: string}} presetData
     * @param {{button: HTMLButtonElement, amount: number|string}} buttonData
     */
    static editPreset(action, presetData, buttonData) {
        const presetGroup = PRESET_GROUPS[action];

        if (!presetGroup) {
            throw new AppError(
                `Unsupported preset action: ${action}`,
                {
                    code: "INVALID_DATA",
                    meta: {action},
                }
            );
        }

        const {presets, activePreset} = presetData;
        const {button, amount} = buttonData;

        const presetButton =
            presets?.[activePreset]?.[presetGroup]?.[
                button.dataset.index
                ];

        if (!presetButton) {
            throw new AppError(
                `${action} button with id "${button.id}" ` +
                "was not found in the active preset.",
                {
                    code: "BUTTON_NOT_FOUND",
                    meta: {
                        action,
                        presetData,
                        buttonData,
                    },
                }
            );
        }

        presetButton.amount = amount;
    }
}
