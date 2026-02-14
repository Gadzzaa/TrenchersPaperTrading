import { UIConfig } from "../Config/UIConfig.js";
export class InitHelper {
  static loadSettings() {
    UIConfig.settings.forEach(({ key, default: def, apply }) => {
      chrome.storage.local.get(key, ({ [key]: value }) => {
        if (value === undefined) value = def;
        apply(value);
      });
    });
  }

  static checkHealth() {
    return new Promise(async (resolve) => {
      chrome.runtime.sendMessage({ type: "HEALTH_PING" }, async (response) => {
        this.healthy = response.status;
        if (this.healthy == null) return;
        if (this.healthy == false) {
          await UIManager.disableUI("no-internet");
          this.initializing = false;
          throw new Error("Health check failed — retrying later.");
        }
      });
    });
  }

  static checkVersion() {
    return new Promise(async (resolve) => {
      const validVersion = await ServerValidation.isLatestVersion();
      if (!validVersion) {
        await UIManager.disableUI("outdated");
        this.initializing = false;
        throw new Error("Outdated version.");
      }
      promise.resolve(true);
    });
  }

  static sessionExists() {
    return new Promise(async (resolve) => {
      let sessionToken = await getFromStorage("sessionToken");
      if (!sessionToken) {
        await UIManager.disableUI("no-session");
        this.initializing = false;
        throw new Error("No session token found.");
      }
      promise.resolve(true);
    });
  }

  static validateSession() {
    if (!sessionExists()) return;
    return new Promise(async (resolve) => {
      const isSessionValid = await this.dataManager.checkSession();
      if (!isSessionValid) {
        clearPositions();
        await UIManager.disableUI("no-session");
        this.initializing = false;
        throw new Error("Session invalid.");
      }
      promise.resolve(true);
    });
  }

  static createWebsocket() {
    return new Promise(async (resolve) => {
      if (ws) console.log("WebSocket already exists, skipping creation.");
      ws = await connectWebSocket().catch((error) => {
        throw new Error("WebSocket connection failed: " + error.message);
      });
    });
  }
}
