import {UIManager} from "../../Utils/Core/UIManager.js";
import {StateManager} from "../Services/StateManager.js";

export class UIConfig {
    static settings = [
        {
            key: "theme",
            default: "dark",
            apply: (value) => {
                document.documentElement.setAttribute("data-theme", value);
            },
        },
        {
            key: "animation",
            default: 3,
            apply: (value) => {
                document.documentElement.style.setProperty(
                    "--anim-time",
                    `${value / 10}s`,
                );
            },
        },
    ];

    /**
     * Creates chrome.storage change listener for dashboard settings.
     * @param {StateManager} stateManager
     * @returns {(changes: any, area: string) => void}
     */
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
            }
        };
    }

    /**
     * Creates runtime message listener for dashboard lifecycle events.
     * @param {StateManager} stateManager
     * @returns {(message: any, sender: any, sendResponse: (response?: any) => void) => void}
     */
    static createRuntimeMessageListener(stateManager) {
        return (message) => {
            if (message.type === "initDashboard") {
                console.log("User registered, initializing dashboard...");
                stateManager.initialize();
            }

            if (message.type === "logoutDashboard") {
                console.log("User logged out, disabling dashboard...");
                stateManager.logout();
            }

            if (message.type === "STATUS_UPDATE") {
                console.log("Health status update received:", message.status);

                if (!message.status) {
                    stateManager.disconnect().then(() => {
                        UIManager.disableUI("no-internet");
                    });
                } else {
                    stateManager.initialize();
                }
            }
            if (message.type === "OFFLINE") {
                // TODO: handle blocker 
            }
            if (message.type === "OUTDATED") {
                // TODO: handle blocker
            }
            if (message.type === "NOT_LOGGED_IN") {
                // TODO: handle blocker
            }
        };
    }
}
