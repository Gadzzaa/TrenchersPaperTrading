import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {SettingsManager} from "../../Account/Core/SettingsManager.js";
import {setDebugMode} from "../../../config.js";
import {StorageManager} from "../../Utils/Core/StorageManager.js";

export class SettingsUILogic {
    static applyTheme(button) {
        switch (button.id) {
            case "lightTheme":
                chrome.storage.local.set({theme: "light"});
                button.classList.add("active");
                break;
            case "darkTheme":
                chrome.storage.local.set({theme: "dark"});
                button.classList.add("active");
                break;
        }
    }

    static setVolume(value) {
        let volume = parseFloat(value) / 100;
        if (isNaN(volume) || volume < 0 || volume > 1)
            throw new AppError("Invalid volume value: " + value, {
                code: "INVALID_VOLUME",
                meta: {
                    value,
                    volume,
                },
            });
        chrome.storage.local.set({volume});
    }

    static setAnimationQuality(value) {
        let quality = parseFloat(value);
        chrome.storage.local.set({animation: quality});
    }

    static async setAndSavePremiumSettings(stateManager) {
        const checkbox = document.getElementById("saveWindowBox");
        const slider = document.getElementById("pnlSlider");

        const settings = {
            saveWindowPos: checkbox ? checkbox.checked : false,
            pnlRefreshInterval: slider ? slider.value * 100 : 500,
        };

        const settingsManager = new SettingsManager(stateManager);

        await settingsManager.saveSettings(settings);

        await Promise.all(
            Object.entries(settings).map(([key, value]) =>
                StorageManager.setToStorage(key, value),
            ),
        );

        console.log("Settings saved:", settings);
    }

    static toggleDebugMode(button) {
        if (button.classList.contains("active")) {
            button.classList.remove("active");
            setDebugMode(false);
            chrome.storage.local.set({debugMode: false});
        } else {
            button.classList.add("active");
            setDebugMode(true);
            chrome.storage.local.set({debugMode: true});
        }
    }
}
