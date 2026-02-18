import { UIConfig } from "../Config/UIConfig.js";
import { UIManager } from "../../Utils/Core/UIManager.js";
import { ServerValidation } from "../../Server/ServerValidation.js";
import { DataManager } from "../../Account/Core/DataManager.js";
import { Variables } from "../../Account/Core/Variables.js";
import { StorageManager } from "../../Utils/Core/StorageManager.js";
import { AppError } from "../../ErrorHandling/Helpers/AppError.js";

export class InitHelper {
  static loadSettings() {
    UIConfig.settings.forEach(({ key, default: def, apply }) => {
      chrome.storage.local.get(key, ({ [key]: value }) => {
        if (value === undefined) value = def;
        apply(value);
      });
    });
  }

  static validateHealth(stateManager) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(
          { type: "HEALTH_PING" },
          async (response) => {
            stateManager.healthy = response?.status;
            if (stateManager.healthy == false) {
              await UIManager.disableUI("no-internet");
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
          },
        );
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
      await UIManager.disableUI("outdated");
      stateManager.initializing = false;
      throw new AppError("Outdated version.", {
        code: "OUTDATED_VERSION",
      });
    }
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

    stateManager.variables = new Variables({ sessionToken });
    stateManager.dataManager = new DataManager(stateManager.variables);

    const isSessionValid = await stateManager.dataManager.checkSession();
    if (!isSessionValid) {
      stateManager.pnlService.clearPositions();
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
