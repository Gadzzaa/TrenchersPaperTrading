import { InitHelper } from "../Helpers/InitHelper.js";
import { UIHelper } from "../Helpers/UIHelper.js";

export class StateManager {
  constructor() {
    this.initializing = false;
    this.healthy = null;
    this.dataUpdater = null;
  }

  async Initialize() {
    if (this.initializing) return;
    this.initializing = true;

    InitHelper.loadSettings();
    await InitHelper.checkHealth();
    await InitHelper.checkVersion();
    await InitHelper.validateSession();
    await InitHelper.createWebsocket();
    UIHelper.clearUI();

    document.body.style.removeProperty("pointer-events");

    this.initializing = false;
  }
}
