import { SettingsUILogic } from "../Helpers/SettingsUILogic.js";
export class SettingsUIManager {
  static createButtons(stateManager) {
    themeButtons.forEach((button) => {
      button.classList.remove("active");
      button.addEventListener("click", () => {
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

    pnlSlider.addEventListener("input", function () {
      SettingsUILogic.setAndSavePremiumSettings(stateManager);
    });

    debugButton.addEventListener("click", () => {
      SettingsUILogic.toggleDebugMode(debugButton);
    });
  }
}
