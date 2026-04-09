import {ServerValidation} from "../../Server/ServerValidation.js";
import {DataManager} from "../../Account/Core/DataManager.js";
import {Variables} from "../../Account/Core/Variables.js";
import {StorageManager} from "../Core/StorageManager.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {ChromeHandler} from "../../ChromeHandler.js";

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
            stateManager.initializing = false;
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
            stateManager.initializing = false;
            throw new AppError("Extension is outdated.", {
                code: "OUTDATED_VERSION",
            });
        } else
            console.log(
                "[TrenchersPT] 🟢 Version check passed. Extension is up to date.",
            );
    }

    static async searchToken(stateManager) {
        let sessionToken = await StorageManager.getFromStorage("sessionToken");
        if (!sessionToken) {
            try {
                await ChromeHandler.sendMessageAsync("NO_SESSION");
            } catch (error) {
                console.error("Failed to notify NO_SESSION state:", error);
            }
            InitHelper.#showLoginPanelIfPresent();
            stateManager.initializing = false;
            throw new AppError("No session token found.", {
                code: "INVALID_TOKEN",
            });
        }
        return sessionToken;
    }

    static async validateSession(stateManager) {
        let sessionToken = await InitHelper.searchToken(stateManager);

        stateManager.variables = new Variables({sessionToken});
        let dataManager = new DataManager(stateManager.variables);

        const isSessionValid = await dataManager.checkSession();
        if (!isSessionValid) {
            stateManager.pnlService?.clearPositions();
            try {
                await StorageManager.removeFromStorage("sessionToken");
            } catch (error) {
                console.error("Failed to clear invalid session token:", error);
            }
            try {
                await ChromeHandler.sendMessageAsync("NO_SESSION");
            } catch (error) {
                console.error("Failed to notify NO_SESSION state:", error);
            }
            InitHelper.#showLoginPanelIfPresent();
            stateManager.initializing = false;
            throw new AppError("Session invalid.", {
                code: "INVALID_TOKEN",
            });
        }
        console.log(
            "[TrenchersPT] 🟢 Session check passed. Valid session token found.",
        );
    }
}
