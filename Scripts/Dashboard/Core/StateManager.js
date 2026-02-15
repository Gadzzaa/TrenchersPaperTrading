import { InitHelper } from "../Helpers/InitHelper.js";
import { UIHelper } from "../Helpers/UIHelper.js";
import { startInterval } from "../Helpers/IntervalHelper.js";
import { UIManager } from "../../Utils/Core/UIManager.js";

export class StateManager {
  constructor() {
    this.initializing = false;
    this.healthy = null;
    this.dataUpdater = null;

    this.variables = null;
    this.dataManager = null;

    this.ws = null;
    this.updateInterval = null;

    this.fetchingBalance = false;
    this.currentPreset = null;
    this.currentContract = null;
  }

  async initialize() {
    console.log("[TrenchersPT] 🟢 Initializing dashboard...");
    if (this.initializing) return;
    this.initializing = true;

    InitHelper.loadSettings();

    await InitHelper.validateHealth(this);

    await InitHelper.validateVersion(this);

    await InitHelper.validateSession(this);
    await InitHelper.createWebsocket(this);

    UIHelper.clearUI();

    document.body.style.removeProperty("pointer-events");

    clearInterval(this.updateInterval);
    this.updateInterval = startInterval(this);

    this.initializing = false;
    UIManager.enableUI();
  }

  async disconnect() {
    console.log("[TrenchersPT] 🔴 Disconnecting dashboard...");

    document.body.style.pointerEvents = "none";

    clearInterval(this.updateInterval);
    this.updateInterval = null;

    this.currentContract = null;

    if (this.ws) {
      disconnectWebSocket();
      this.ws = null;
    }
  }

  async logout() {
    this.disconnect();
    clearPositions();
    await UIManager.disableUI("no-session");
  }
}
