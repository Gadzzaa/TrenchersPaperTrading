import {defaultPresets} from "../Config/defaultPresets.js";
import {PresetHelper} from "../Helpers/PresetHelper.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {StateManager} from "../Services/StateManager.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";

export class PresetManager {
    /**
     * Initializes preset UI and event listeners.
     * @param {StateManager} stateManager
     */
    static initUI(stateManager) {
        let currentPreset = PresetManager.getUsingPreset();
        PresetManager.applyPreset(currentPreset, stateManager);

        const presetButtons = document.querySelectorAll("#Presets .preset");
        if (!presetButtons)
            throw new AppError("Preset buttons not found", {
                code: "PRESET_NOT_FOUND",
                meta: {
                    presetButtons,
                },
            });

        presetButtons.forEach((button) => {
            button.addEventListener("click", () => {
                PresetManager.applyPreset(button.id, stateManager);
            });
        });
    }

    /**
     * Applies a preset to UI and state.
     * @param {string} presetName
     * @param {StateManager} stateManager
     */
    static applyPreset(presetName, stateManager) {
        let prevPresetName = PresetManager.getUsingPreset();
        let prevPresetData = PresetManager.getPresetData(prevPresetName);
        try {
            let presetData = PresetManager.getPresetData(presetName);
            PresetHelper.applyPreset(presetName, presetData, stateManager);
        } catch (error) {
            PresetHelper.applyPreset(prevPresetName, prevPresetData, stateManager);
            throw ErrorHandler.log(`Could not apply preset: ${presetName}`, {
                code: "PRESET_APPLY_FAILED",
                cause: error,
                meta: {
                    presetName,
                    prevPresetName,
                },
            });
        }
    }

    /**
     * Returns currently selected preset id.
     * @returns {string|null}
     */
    static getUsingPreset() {
        return localStorage.getItem("usingPreset");
    }

    /**
     * Returns serialized presets from storage.
     * @returns {string|null}
     */
    static getPresets() {
        return localStorage.getItem("presets");
    }

    /**
     * Persists updated preset data and marks it pending.
     * @param {Record<string, any>} newPresets
     */
    static setPresets(newPresets) {
        localStorage.setItem("presets", JSON.stringify(newPresets));
        localStorage.setItem("pendingPresets", true);
    }

    /**
     * Returns parsed preset data for a given preset id.
     * @param {string} presetName
     * @returns {Record<string, any>}
     */
    static getPresetData(presetName) {
        if (!PresetManager.getPresets()) PresetManager.setPresets(defaultPresets);

        // Get data for new preset
        const allPresetsData = JSON.parse(PresetManager.getPresets());
        const presetData = allPresetsData?.[presetName];

        if (!allPresetsData || !presetData)
            throw new AppError("No presets data found", {
                code: "PRESET_NOT_FOUND",
                meta: {
                    presetName,
                    allPresetsData,
                    presetData,
                },
            });

        if (typeof presetData !== "object")
            throw new AppError("Invalid preset data format", {
                code: "PRESET_DATA_INVALID",
                meta: {
                    presetName,
                    allPresetsData,
                    presetData,
                },
            });

        return presetData;
    }
}
