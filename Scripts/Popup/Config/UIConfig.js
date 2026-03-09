import {UILoader} from "../Core/UILoader.js"
import {UIHelper} from "../Helpers/UIHelper.js";
import {DialogManager} from "../Core/DialogManager.js";

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

    static createStorageMessageListener() {
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
        return (message, _sender, sendResponse) => {
            if (message.origin !== "TrenchersPaperTrading") return;
            if (message.type === "STATUS_UPDATE") {
                console.log("Health status update received:", message.status);
                if (!message.status) {
                    // disconnectPopup and internet
                } else stateManager.initialize()
            }
            if (message.type === "OUTDATED_UI") {
                new DialogManager(stateManager)
                    .addTitle("Update Available")
                    .addMessage(
                        "Your extension is out of date. Please update to the latest version to continue using it.",
                    )
                    .addType("Blocker")
                    .show()
                    .then(() => sendResponse({ok: true}))
                    .catch((error) =>
                        sendResponse({
                            ok: false,
                            error: error?.message || "Failed to show blocker dialog.",
                        }),
                    );
                return true;
            }
        };
    }
}
