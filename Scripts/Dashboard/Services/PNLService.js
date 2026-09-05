import {PNLDataManager} from "../Core/PNLDataManager.js";
import {PnlUIController} from "../Core/PnlUIController.js";
import {PoolWatcher} from "../Core/PoolWatcher.js";
import {PositionManager} from "../Core/PositionManager.js";
import {WebsocketManager} from "../Core/WebsocketManager.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";

import {DataManager} from "../../Account/Core/DataManager.js";
import {StorageManager} from "../../Utils/Core/StorageManager.js";

export class PNLService {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.wsManager = new WebsocketManager(stateManager);

        this.positionManager = new PositionManager();
        this.poolWatcher = new PoolWatcher(this.wsManager);
        this.ui = new PnlUIController();
        this.pnlDataManager = new PNLDataManager();

        this.refreshTime = 500; // Default refresh time in ms
        this.lastUpdateTime = Date.now();
    }

    async start() {
        await this.wsManager.connect((data) => {
            this.poolWatcher.updatePool(data);
            this.update();
        })
        console.log(
            "[TrenchersPT] 🟢 Websocket connected. Listening for pool updates...",
        );
    }

    stop() {
        this.wsManager.disconnect();
        this.positionManager.clear();
        this.poolWatcher.clear();
        this.ui.clear();
    }

    update(force = false) {
        const now = Date.now();

        if (!force && now - this.lastUpdateTime < this.refreshTime)
            return;

        let pool = this.poolWatcher.get(this.positionManager.currentPool);

        if (!pool)
            pool = {
                price: 0,
                liquidity: 0,
            }


        const uiData = this.positionManager.calculatePnlUI(pool.price,);

        if (uiData)
            this.ui.update(uiData);

        this.lastUpdateTime = now;
    }

    setActiveToken(poolAddress) {
        this.positionManager.setActive(poolAddress);

        const pnlData = this.pnlDataManager.get(poolAddress);

        void this.#configureActivePool(poolAddress, pnlData).catch((error) => {
            ErrorHandler.log(error, {poolAddress});
        });
    }

    async syncTradeLog() {
        const dataManager = new DataManager(this.stateManager);
        const tradeLog = await dataManager.getTradeLog();
        const tokens = tradeLog?.tokens;
        if (!Array.isArray(tokens)) {
            console.warn("⚠️ Trade log response did not include token positions.");
            return false;
        }
        this.positionManager.setPositions(tokens);
        return true;
    }

    isActive() {
        return this.positionManager.currentPool !== null;
    }

    clearPositions(global = true) {
        this.positionManager.clear();
        this.ui.clear();
        if (global) localStorage.removeItem("openPositions");
    }

    async #configureActivePool(poolAddress, pnlData) {
        let refreshTime = 500;

        try {
            const storedRefreshTime =
                await StorageManager.getFromStorage("pnlRefreshInterval");

            const parsedRefreshTime = Number(storedRefreshTime);

            if (Number.isFinite(parsedRefreshTime) && parsedRefreshTime > 0)
                refreshTime = parsedRefreshTime;
        } catch (error) {
            ErrorHandler.log(error, {poolAddress});
        }

        if (this.positionManager.currentPool !== poolAddress)
            return;

        this.refreshTime = refreshTime;
        this.poolWatcher.watch(poolAddress, pnlData);
    }
}
