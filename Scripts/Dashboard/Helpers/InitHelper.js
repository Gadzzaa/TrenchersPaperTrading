import { UIConfig } from "../Config/UIConfig.js";
import { UIManager } from "../../Utils/Core/UIManager.js";
import { ServerValidation } from "../../Server/ServerValidation.js";
import { DataManager } from "../../Account/Core/DataManager.js";
import { Variables } from "../../Account/Core/Variables.js";
import { StorageManager } from "../../Utils/Core/StorageManager.js";

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
      chrome.runtime.sendMessage({ type: "HEALTH_PING" }, async (response) => {
        stateManager.healthy = response.status;
        if (stateManager.healthy == null) return;
        if (stateManager.healthy == false) {
          await UIManager.disableUI("no-internet");
          stateManager.initializing = false;
          promise.reject(new Error("Health check failed."));
        }
        promise.resolve();
      });
    });
  }

  static async validateVersion(stateManager) {
    const validVersion = await ServerValidation.isLatestVersion();
    if (!validVersion) {
      await UIManager.disableUI("outdated");
      stateManager.initializing = false;
      throw new Error("Outdated version.");
    }
  }

  static async searchToken(stateManager) {
    let sessionToken = await StorageManager.getFromStorage("sessionToken");
    if (!sessionToken) {
      await UIManager.disableUI("no-session");
      stateManager.initializing = false;
      throw new Error("No session token found.");
    }
    return sessionToken;
  }

  static async validateSession(stateManager) {
    let sessionToken = await InitHelper.searchToken(stateManager);

    stateManager.variables = new Variables({ sessionToken });
    stateManager.dataManager = new DataManager(stateManager.variables);

    const isSessionValid = await stateManager.dataManager.checkSession();
    if (!isSessionValid) {
      clearPositions();
      await UIManager.disableUI("no-session");
      stateManager.initializing = false;
      throw new Error("Session invalid.");
    }
  }

  static async createWebsocket(stateManager) {
    if (stateManager.ws) {
      console.log("WebSocket already exists, skipping creation.");
      return;
    }
    stateManager.ws = await connectWebSocket().catch((error) => {
      throw new Error("WebSocket connection failed: " + error.message);
    });
  }
}
