import { defaultPresets } from "../Config/defaultPresets.js";
import { PresetHelper } from "../Helpers/PresetHelper.js";
import { AppError } from "../../ErrorHandling/Helpers/AppError.js";

export class PresetManager {
  static initUI() {
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
        PresetManager.applyPreset(button.id);
      });
    });
  }

  static applyPreset(presetName) {
    let presetData = PresetManager.getPresetData(presetName);

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
  }

  static getUsingPreset() {
    return localStorage.getItem("usingPreset");
  }

  static getPresets() {
    return localStorage.getItem("presets");
  }

  static setPresets(newPresets) {
    localStorage.setItem("presets", JSON.stringify(newPresets));
    localStorage.setItem("pendingPresets", true);
  }

  static getPresetData(presetName) {
    if (!JSON.parse(getPresets())[presetName])
      PresetManager.setPresets(defaultPresets);

    // Get data for new preset
    const allPresetsData = JSON.parse(getPresets());
    const presetData = allPresetsData[presetName];
    if (!allPresetsData || !presetData)
      throw new AppError("No presets data found", {
        code: "PRESET_NOT_FOUND",
        meta: {
          presetName,
          allPresetsData,
          presetData,
        },
      });

    return presetData;
  }
}
