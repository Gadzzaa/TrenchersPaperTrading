import {ServerValidation} from "../../Server/ServerValidation.js";
import {DataManager} from "../../Account/Core/DataManager.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {ChromeHandler} from "../../ChromeHandler.js";
import {DialogManager} from "../../Dashboard/Core/DialogManager.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {isAuthError} from "../../Server/AuthErrorHelper.js";

export class InitHelper {
    static #showLoginPanelIfPresent() {
        const loginPanel = document.getElementById("loginPanel");
        if (loginPanel)
            loginPanel.classList.remove("loginHidden");
    }

    static loadSettings(UIConfig) {
        UIConfig.settings.forEach(({key, default: def, apply}) => {
            chrome.storage.local.get(key, ({[key]: value}) => {
                if (value === undefined) value = def;
                apply(value);
            });
        });
    }

    static async validateHealth(stateManager) {
        let healthy = await ChromeHandler.sendMessageAsync("HEALTH_PING")
        if (!healthy) {
            throw new AppError("Health check failed.", {
                code: "HEALTH_CHECK_FAILED",
            })
        }
        console.log(
            "[TrenchersPT] 🟢 Health check passed. Server is healthy.",
        )
    }

    static async validateVersion(stateManager) {
        const validVersion = await ServerValidation.isLatestVersion();
        if (!validVersion) {
            ChromeHandler.sendMessageAsync("OUTDATED")
            throw new AppError("Extension is outdated.", {
                code: "OUTDATED_VERSION",
            });
        } else
            console.log(
                "[TrenchersPT] 🟢 Version check passed. Extension is up to date.",
            );
    }

    static async searchToken(stateManager) {
        try {
            await stateManager.api.restoreSession()
        } catch (error) {
            if (!isAuthError(error))
                throw error;

            InitHelper.#showLoginPanelIfPresent();
            throw new AppError("No session token found.", {
                code: "INVALID_TOKEN",
                cause: error,
            });
        }
    }

    static async validateSession(stateManager) {
        await InitHelper.searchToken(stateManager);

        const dataManager = new DataManager(stateManager);

        const isSessionValid = await dataManager.checkSession();
        if (!isSessionValid) {
            stateManager.pnlService?.clearPositions();
            try {
                await ChromeHandler.sendMessageAsync("NO_SESSION", {
                    workerRevision:
                        stateManager.api.getWorkerRevision(),
                });
            } catch (error) {
                console.error("Failed to notify NO_SESSION state:", error);
            }
            InitHelper.#showLoginPanelIfPresent();
            throw new AppError("Session invalid.", {
                code: "INVALID_TOKEN",
            });
        }
        console.log(
            "[TrenchersPT] 🟢 Session check passed. Valid session token found.",
        );
    }

    static async validateWebsocketLimits(stateManager) {
        const dataManager = new DataManager(stateManager);

        const limits = await dataManager.getWebsocketLimits();

        if (!limits.allowed) {
            new DialogManager(stateManager)
                .addMessage("Premium required!" + "\n" + "Too many active sessions detected.")
                .addType("multiple-sessions")
                .show()
                .catch((error) => {
                    ErrorHandler.show(error);
                });
            throw new AppError("Websocket Limit not allowed.", {
                code: "TOO_MANY_SESSIONS",
                meta: {
                    allowed: limits.allowed,
                    remaining: limits.remaining,
                }
            })
        }
        console.log(
            "[TrenchersPT] 🟢 Websocket limits check passed."
        )

    }
}
