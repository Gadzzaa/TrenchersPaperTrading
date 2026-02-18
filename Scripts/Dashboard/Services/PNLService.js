import { PNLDataManager } from "../Core/PNLDataManager.js";
import { PnlUIController } from "../Core/PnlUIController.js";
import { PoolWatcher } from "../Core/PoolWatcher.js";
import { PositionManager } from "../Core/PositionManager.js";
import { WebsocketManager } from "../Core/WebsocketManager.js";

import { DataManager } from "../../Account/Core/DataManager.js";
import { StorageManager } from "../../Utils/Core/StorageManager.js";

export class PNLService {
  constructor() {
    this.wsManager = new WebsocketManager();

    this.positionManager = new PositionManager();
    this.poolWatcher = new PoolWatcher(this.wsManager);
    this.ui = new PnlUIController();
    this.pnlDataManager = new PNLDataManager();

    this.refreshTime = 500; // Default refresh time in ms
    this.lastUpdateTime = Date.now();
  }

  async start() {
    await this.wsManager.connect((data) => {
      if (data.type === "poolUpdate") {
        this.poolWatcher.updatePool(data);
        this.update();
      }
    });
  }

  update() {
    if (Date.now() - this.lastUpdateTime < this.refreshTime) return;
    const pool = this.poolWatcher.get(this.positionManager.currentPool);
    if (!pool?.price) return;

    const uiData = this.positionManager.calculatePnlUI(
      pool.price,
      pool.posClosed,
    );
    if (uiData) this.ui.update(uiData);
  }

  setActiveToken(poolAddress) {
    this.positionManager.setActive(poolAddress);
    let pool = this.positionManager.getPosition(poolAddress);
    if (!pool) throw new Error("No position found for pool: " + poolAddress);

    StorageManager.getFromStorage("pnlSlider").then((sliderValue) => {
      if (!sliderValue) sliderValue = 500;
      this.poolWatcher.watch(poolAddress);
      this.refreshTime = sliderValue;
    });
  }

  async importTradeLog(variables) {
    const dataManager = new DataManager(variables);
    let tradeLog = await dataManager?.getTradeLog()?.tokens;
    PositionManager.setPositions(tradeLog);
  }

  isActive() {
    return this.positionManager.currentPool?.toString() !== null;
  }

  clearPositions(global = true) {
    this.positionManager.clear();
    this.ui.clear();
    if (global) localStorage.removeItem("openPositions");
  }
}
