import {AccountUIManager} from "./AccountUIManager.js";
import {LoginUIManager} from "./LoginUIManager.js";
import {SettingsUIManager} from "./SettingsUIManager.js";
import {FooterHelper} from "../Helpers/FooterHelper.js";
import {UIConfig} from "../Config/UIConfig.js";

export class GlobalUIManager {
    static createButtons(stateManager) {
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

    static createRuntimeEvents(stateManager) {
        chrome.runtime.onMessage.addListener(
            UIConfig.createRuntimeMessageListener(
                stateManager
            )
        );
    }

    static createStorageEvents(stateManager) {
        chrome.storage.onChanged.addListener(
            UIConfig.createStorageMessageListener(
                stateManager
            )
        );
    }

    static disableArrowKeys() {
        document.addEventListener("keydown", (e) => {
            const scrollKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
            if (scrollKeys.includes(e.key)) {
                e.preventDefault();
            }
        });
    }
}
