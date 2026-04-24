import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class PresetHelper {
    static applyPreset(presetName, presetData, stateManager) {
        PresetHelper.applyPresetButtons(
            "buy",
            presetData.buys,
            (amount) => `Buy ${amount} SOL worth`,
        );
        PresetHelper.applyPresetButtons(
            "sell",
            presetData.sells,
            (amount) => `Sell ${amount}%`,
        );

        PresetHelper.applyPresetUI(presetName);
        localStorage.setItem("usingPreset", presetName);
        stateManager.currentPreset = presetName;
    }

    /**
     * Switches active preset indicator in UI.
     * @param {string} presetName
     */
    static applyPresetUI(presetName) {
        const oldPresetUI = document.querySelector(".activePreset");
        const newPresetUI = document.getElementById(presetName);

        if (!newPresetUI)
            throw new AppError(`Preset UI with id ${presetName} not found`, {
                code: "PRESET_NOT_FOUND",
                meta: {
                    newPresetId: presetName,
                },
            });
        if (!oldPresetUI)
            throw new AppError("No active preset found", {
                code: "PRESET_NOT_FOUND",
                meta: {
                    oldPresetId: oldPresetUI ? oldPresetUI.id : null,
                },
            });

        oldPresetUI.classList.remove("activePreset");
        newPresetUI.classList.add("activePreset");
    }

    /**
     * Applies preset button amounts and tooltips by type.
     * @param {"buy"|"sell"} type
     * @param {Record<string, {amount: number|string}>} dataArray
     * @param {(amount: number|string) => string} tooltipBuilder
     */
    static applyPresetButtons(type, dataArray, tooltipBuilder) {
        Object.entries(dataArray || {}).forEach(([, item], index) => {
            const buttonId = `${type}${index + 1}`;
            const button = document.getElementById(buttonId);

            if (!button)
                throw new AppError(`Button ${buttonId} not found`, {
                    code: "PRESET_NOT_FOUND",
                    meta: {
                        type,
                        dataArray,
                        item,
                        index,
                    },
                });

            button.dataset.amount = item.amount;
            button.dataset.tooltip = tooltipBuilder(item.amount);
            button.textContent = item.amount;
        });
    }
}
