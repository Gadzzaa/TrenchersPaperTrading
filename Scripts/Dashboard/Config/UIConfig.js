import {StateManager} from "../Services/StateManager.js";
import {updateBalanceUI} from "../Helpers/BalanceUpdater.js";

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
            if (message.origin !== "TrenchersPaperTrading") return;

            if (message.type === "initDashboard") {
                console.log("User registered, initializing dashboard...");
                stateManager.initialize();
            }

            if (message.type === "logoutDashboard") {
                console.log("User logged out, disabling dashboard...");
                stateManager.logout();
            }
            if (message.type === "clearPositions") {
                stateManager?.pnlService.clearPositions(true)
            }
            if (message.type === "updateBalanceUI") {
                updateBalanceUI(true, stateManager);
            }

            if (message.type === "STATUS_UPDATE") {
                const isHealthy = message?.payload?.status ?? message?.status;
                console.log("Health status update received:", isHealthy);

                if (!isHealthy) {
                    stateManager.disconnect()
                } else {
                    stateManager.initialize();
                }
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
