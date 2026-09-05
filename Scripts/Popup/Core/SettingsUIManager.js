import {SettingsUILogic} from "../Helpers/SettingsUILogic.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";

export class SettingsUIManager {
    static createButtons(stateManager) {
        const themeButtons = document.querySelectorAll(".theme");
        const volumeSlider = document.getElementById("volumeSlider");
        const animationSlider = document.getElementById("animationSlider");
        const saveWindowBox = document.getElementById("saveWindowBox");
        const pnlSlider = document.getElementById("pnlSlider");
        const debugButton = document.getElementById("debugButton");

        themeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                document.querySelector(".theme.active").classList.remove("active");
                SettingsUILogic.applyTheme(button);
            });
        });

        volumeSlider.addEventListener("input", function () {
            SettingsUILogic.setVolume(this.value);
        });

        animationSlider.addEventListener("input", function () {
            SettingsUILogic.setAnimationQuality(this.value);
        });

        saveWindowBox.addEventListener("change", () => {
            void SettingsUIManager.#savePremiumSettings(stateManager);
        });

        pnlSlider.addEventListener("mouseup", function () {
            void SettingsUIManager.#savePremiumSettings(stateManager);
        });

        debugButton.addEventListener("click", () => {
            SettingsUILogic.toggleDebugMode(debugButton);
        });
    }

    static async #savePremiumSettings(stateManager) {
        try {
            await SettingsUILogic.setAndSavePremiumSettings(stateManager);
        } catch (error) {
            ErrorHandler.show(
                error,
                {show: false},
                {show: true, stateManager},
            );
        }
    }
}
