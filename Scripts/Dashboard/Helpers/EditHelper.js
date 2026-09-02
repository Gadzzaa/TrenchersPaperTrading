import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {StateManager} from "../Services/StateManager.js";

export class EditHelper {
    /**
     * Exits edit mode after transition.
     * @param {StateManager} stateManager
     */
    static activateEditMode(stateManager) {
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
    static deactivateEditMode() {
        const body = document.body;
        const sellsTab = document.getElementById("Sells");

        sellsTab.classList.remove("hidden");
        body.classList.add("edit-mode");
    }

    /**
     * Updates buy preset amount for selected button.
     * @param {{presets: any, activePreset: null}} presetData
     * @param {{button: HTMLButtonElement, amount: number|string}} buttonData
     */
    static editBuyPresets(
        presetData,
        buttonData,
    ) {
        const {presets, activePreset} = presetData;
        const {button, amount} = buttonData;
        const buttonIndex = presets?.[activePreset]?.buys?.[button.dataset.index];

        if (!buttonIndex)
            throw new AppError(
                `Buy button with id "${button.id}" not found in active preset.`,
                {
                    code: "BUTTON_NOT_FOUND",
                    meta: {
                        presetData,
                        buttonData,
                    },
                },
            );

        buttonIndex.amount = amount;
    }

    /**
     * Updates sell preset amount for selected button.
     * @param {{presets: any, activePreset: null}} presetData
     * @param {{button: HTMLButtonElement, amount: number|string}} buttonData
     */
    static editSellPresets(
        presetData,
        buttonData,
    ) {
        const {
            presets,
            activePreset
        } = presetData;
        const {
            button,
            amount
        } = buttonData;
        const buttonIndex = presets?.[activePreset]?.sells?.[button.dataset.index];

        if (!buttonIndex)
            throw new Error(
                `Sell button with id ${button.id} not found in active preset.`,
            );

        buttonIndex.amount = amount;
    }
}
