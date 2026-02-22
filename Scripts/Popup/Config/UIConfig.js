import {UILoader} from "../Core/UILoader.js"
import {UIHelper} from "../Helpers/UIHelper.js";

export class UIConfig {
    static settings = [
        {
            key: "username",
            default: "Guest",
            apply: (value) => {
                UILoader.updateUsername(value);
            },
        },
        {
            key: "theme",
            default: "dark",
            apply: (value) => {
                UILoader.updateTheme(value);
            },
        },
        {
            key: "volume",
            default: 1.0,
            apply: (value) => {
                UILoader.applyVolumeUI(value);
            },
        },
        {
            key: "animation",
            default: 3,
            apply: (value) => {
                UILoader.applyQualityUI(value);
            },
        },
        {
            key: "debugMode",
            default: false,
            apply: (value) => {
                UILoader.applyDebugModeUI(value);
            },
        },
    ];

    static createStorageMessageListener(stateManager) {
        return (changes, area) => {
            if (area === "local" && changes.theme) {
                document.documentElement.setAttribute(
                    "data-theme",
                    changes.theme.newValue,
                );
            }
            if (area === "local" && changes.animation) {
                document.documentElement.style.setProperty(
                    "--anim-time",
                    `${changes.animation.newValue / 10}s`,
                );
                UIHelper.setQualityPreset(changes.animation.newValue);
            }
        }
    }

    static createRuntimeMessageListener(stateManager) {
        return (message, sender, sendResponse) => {
            if (message.type === "STATUS_UPDATE") {
                console.log("Health status update received:", message.status);
                if (!message.status) {
                    // disconnectPopup and internet
                } // init else
            }
        };/**/
    }
}
