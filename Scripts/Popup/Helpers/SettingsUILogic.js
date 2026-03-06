import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
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

    static setAndSavePremiumSettings(stateManager) {
        const checkbox = document.getElementById("saveWindowBox");
        const slider = document.getElementById("pnlSlider");
        let settings = {
            saveWindowPos: checkbox ? checkbox.checked : false,
            pnlRefreshInterval: slider ? slider.value * 100 : 500,
        };

        let settingsManager = new SettingsManager(stateManager.variables);
        settingsManager
            .saveSettings(settings)
            .then(() => {
                console.log("Settings saved:", settings);
                Object.entries(settings).forEach(([key, value]) =>
                    StorageManager.setToStorage(key, value),
                );
            })
            .catch((err) => {
                throw ErrorHandler.log(err);
            });
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
