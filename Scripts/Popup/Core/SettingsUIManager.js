import {SettingsUILogic} from "../Helpers/SettingsUILogic.js";

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
            SettingsUILogic.setAndSavePremiumSettings(stateManager);
        });

        pnlSlider.addEventListener("mouseup", function () {
            SettingsUILogic.setAndSavePremiumSettings(stateManager);
        });

        debugButton.addEventListener("click", () => {
            SettingsUILogic.toggleDebugMode(debugButton);
        });
    }
}
