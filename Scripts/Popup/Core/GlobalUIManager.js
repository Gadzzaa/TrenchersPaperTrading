import { AccountUIManager } from "./AccountUIManager.js";
import { LoginUIManager } from "./LoginUIManager.js";
import { SettingsUIManager } from "./SettingsUIManager.js";
import { FooterHelper } from "../Helpers/FooterHelper.js";
export class GlobalUIManager {
  static async createButtons(stateManager) {
    const footerButtons = document.querySelectorAll(".footerButton");

    AccountUIManager.createButtons(stateManager);
    LoginUIManager.createButtons(stateManager);
    SettingsUIManager.createButtons(stateManager);

    footerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        FooterHelper.focusButton(button);
      });
    });
  }
}
