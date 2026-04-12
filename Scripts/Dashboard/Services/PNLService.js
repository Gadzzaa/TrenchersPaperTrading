import {PNLDataManager} from "../Core/PNLDataManager.js";
import {PnlUIController} from "../Core/PnlUIController.js";
import {PoolWatcher} from "../Core/PoolWatcher.js";
import {PositionManager} from "../Core/PositionManager.js";
import {WebsocketManager} from "../Core/WebsocketManager.js";

import {DataManager} from "../../Account/Core/DataManager.js";
import {StorageManager} from "../../Utils/Core/StorageManager.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";

export class PNLService {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.wsManager = new WebsocketManager(stateManager.variables.getAuthToken());

        this.positionManager = new PositionManager();
        this.poolWatcher = new PoolWatcher(this.wsManager);
        this.ui = new PnlUIController();
        this.pnlDataManager = new PNLDataManager();

        this.refreshTime = 500; // Default refresh time in ms
        this.lastUpdateTime = Date.now();
    }

    async start() {
        try {
            await this.wsManager.connect((data) => {
                this.poolWatcher.updatePool(data);
                this.update();
            })
            console.log(
                "[TrenchersPT] 🟢 Websocket connected. Listening for pool updates...",
            );
        } catch (err) {
            throw ErrorHandler.log(err);
        }
    }

    stop() {
        this.wsManager.disconnect();
        this.positionManager.clear();
        this.poolWatcher.clear();
        this.ui.clear();
    }

    update(force = false) {
        if (Date.now() - this.lastUpdateTime < this.refreshTime && !force) return;
        let pool = this.poolWatcher.get(this.positionManager.currentPool);
        if (!pool)
            pool = {
                price: 0,
                liquidity: 0,
            }


        const uiData = this.positionManager.calculatePnlUI(
            pool.price,
        );
        if (uiData)
            this.ui.update(uiData);
    }

    setActiveToken(poolAddress) {
        this.positionManager.setActive(poolAddress);
        let pnlData = this.pnlDataManager.get(poolAddress);

        StorageManager.getFromStorage("pnlRefreshInterval").then((sliderValue) => {
            if (!sliderValue) sliderValue = 500;
            this.poolWatcher.watch(poolAddress, pnlData);
            this.refreshTime = sliderValue;
        });
    }

    async syncTradeLog(variables) {
        const dataManager = new DataManager(variables);
        let tradeLog = await dataManager.getTradeLog();
        let tokens = tradeLog?.tokens;
        this.positionManager.setPositions(tokens);
    }

    isActive() {
        return this.positionManager.currentPool !== null;
    }

    clearPositions(global = true) {
        this.positionManager.clear();
        this.ui.clear();
        if (global) localStorage.removeItem("openPositions");
    }
}
