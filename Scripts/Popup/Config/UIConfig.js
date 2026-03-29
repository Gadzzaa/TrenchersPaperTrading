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
            if (message.origin !== "TrenchersPaperTrading") return true;
            if (message.type === "STATUS_UPDATE") {
                if (message.payload.status) {
                    stateManager.initialize(true);
                    sendResponse({ok: true});
                } else {
                    stateManager.disconnect();
                    new DialogManager(stateManager)
                        .addTitle("Server Unavailable")
                        .addMessage("Lost connection to the server. Reconnecting...")
                        .addType("Blocker", {loading: true, releaseOn: "STATUS_HEALTHY"})
                        .show()
                        .then(() => {
                            sendResponse({ok: true})
                        })
                }

                return true;
            }
            if (message.type === "OUTDATED_UI") {
                new DialogManager(stateManager)
                    .addTitle("Update Available")
                    .addMessage(
                        "Your extension is out of date. Please update to the latest version to continue using it.",
                    )
                    .addType("Blocker", {loading: false})
                    .show()
                    .then(() => {
                        sendResponse({ok: true})
                    });

                return true;
            }

            if (message.type === "NO_SESSION_UI") {
                const loginPanel = document.getElementById("loginPanel");
                loginPanel.classList.remove("loginHidden")
                sendResponse({ok: true});

                return true;
            }

            if (message.type === "SESSION_VALID_UI") {
                const loginPanel = document.getElementById("loginPanel");
                !loginPanel.classList.contains("loginHidden") && loginPanel.classList.add("loginHidden")
                sendResponse({ok: true});

                return true;
            }
        };
    }
}
