import {UIManager} from "../Core/UIManager.js";
import {ServerValidation} from "../../Server/ServerValidation.js";
import {DataManager} from "../../Account/Core/DataManager.js";
import {Variables} from "../../Account/Core/Variables.js";
import {StorageManager} from "../Core/StorageManager.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {ChromeHandler} from "../../ChromeHandler.js";

export class InitHelper {
    static loadSettings(UIConfig) {
        UIConfig.settings.forEach(({key, default: def, apply}) => {
            chrome.storage.local.get(key, ({[key]: value}) => {
                if (value === undefined) value = def;
                apply(value);
            });
        });
    }

    static validateHealth(stateManager) {
        return new Promise((resolve, reject) => {
            try {
                ChromeHandler.sendMessageAsync("HEALTH_PING").then((response) => {
                    stateManager.healthy = response?.status;
                    if (stateManager.healthy === false) {
                        stateManager.initializing = false;
                        reject(
                            new AppError("Health check failed.", {
                                code: "HEALTH_CHECK_FAILED",
                            }),
                        );
                    }
                    resolve(
                        console.log(
                            "[TrenchersPT] 🟢 Health check passed. Server is healthy.",
                        ),
                    );
                })
            } catch (error) {
                reject(
                    new AppError("Health check failed.", {
                        code: "HEALTH_CHECK_FAILED",
                        cause: error,
                    }),
                );
            }
        });
    }

    static async validateVersion(stateManager) {
        const validVersion = await ServerValidation.isLatestVersion();
        if (!validVersion) {
            await ChromeHandler.sendMessageAsync("OUTDATED")
            stateManager.initializing = false;
            console.log("[TrenchersPT] 🔴 Version check failed. Extension is outdated.");
        } else
            console.log(
                "[TrenchersPT] 🟢 Version check passed. Extension is up to date.",
            );
    }

    static async searchToken(stateManager) {
        let sessionToken = await StorageManager.getFromStorage("sessionToken");
        if (!sessionToken) {
            await UIManager.disableUI("no-session");
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
            await UIManager.disableUI("no-session");
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
