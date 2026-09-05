import {StateManager} from "../Services/StateManager.js";
import {updateBalanceUI} from "../Helpers/BalanceUpdater.js";
import {DialogManager} from "../Core/DialogManager.js"
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {acceptAuthNotification} from "../../Server/AuthNotification.js";

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
        return (message, sender, sendResponse) => {
            if (message.origin !== "TrenchersPaperTrading") return true;

            if (message.type === "initDashboard") {
                console.log("User registered, initializing dashboard...");
                stateManager.initialize().catch(handleInitializationError);
                sendResponse({ok: true})
                return true;
            }

            if (message.type === "logoutDashboard") {
                console.log("User logged out, disabling dashboard...");
                stateManager.logout().catch((error) => {
                    ErrorHandler.show(error);
                });
                sendResponse({ok: true})
                return true;
            }
            if (message.type === "clearPositions") {
                stateManager.pnlService?.clearPositions(true)
                sendResponse({ok: true})
                return true;
            }
            if (message.type === "updateBalanceUI") {
                updateBalanceUI(true, stateManager);
                sendResponse({ok: true})
                return true;
            }

            if (message.type === "STATUS_UPDATE") {
                if (message.payload.status) {
                    stateManager.initialize(true).catch(handleInitializationError)
                } else {
                    stateManager.disconnect();
                    new DialogManager(stateManager)
                        .addMessage("Server unavailable. Reconnecting...")
                        .addType("no-internet")
                        .show()
                        .catch((error) => {
                            ErrorHandler.show(error);
                        })
                }

                sendResponse({ok: true});
                return true;
            }

            if (message.type === "OUTDATED_UI") {
                new DialogManager(stateManager)
                    .addMessage("Update required!")
                    .addType("outdated")
                    .show()
                    .catch((error) => {
                        ErrorHandler.show(error);
                    })
                sendResponse({ok: true});
                return true;
            }

            if (message.type === "NO_SESSION_UI") {
                if (!acceptAuthNotification(message, sender, stateManager.api)) {
                    sendResponse({ok: true, ignored: true});
                    return true;
                }

                stateManager.api.invalidateSession()
                stateManager.disconnect({clearSessionData: true});

                new DialogManager(stateManager)
                    .addMessage("Please log in to trade")
                    .addType("no-session")
                    .show()
                    .then((value) => {
                        if (value?.dontRestart) return;
                        return stateManager.initialize(true).catch(handleInitializationError)
                    }).catch((error) => {
                    ErrorHandler.show(error);
                });

                sendResponse({ok: true});
                return true;
            }
            if (message.type === "SESSION_VALID_UI") {
                if (!acceptAuthNotification(message, sender, stateManager.api)) {
                    sendResponse({ok: true, ignored: true});
                    return true;
                }

                sendResponse({ok: true});
                return true;
            }
        };
    }
}

function handleInitializationError(error) {
    if (
        error?.code === "INIT_CANCELLED" ||
        error?.code === "CONNECTION_CANCELLED" ||
        error?.code === "SESSION_CHANGED"
    ) {
        return;
    }

    ErrorHandler.show(error);
}
