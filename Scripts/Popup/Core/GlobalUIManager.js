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
        let runtimeMessageListener =
            UIConfig.createRuntimeMessageListener(stateManager);

        // Remove existing listeners before adding new ones to prevent duplicates
        if (runtimeMessageListener) {
            chrome.runtime.onMessage.removeListener(runtimeMessageListener);
        }

        chrome.runtime.onMessage.addListener(runtimeMessageListener);
    }

    static createStorageEvents(stateManager) {
        let storageChangeListener =
            UIConfig.createStorageMessageListener(stateManager);

        // Remove existing listeners before adding new ones to prevent duplicates
        if (storageChangeListener)
            chrome.storage.onChanged.removeListener(storageChangeListener);

        chrome.storage.onChanged.addListener(storageChangeListener);
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
