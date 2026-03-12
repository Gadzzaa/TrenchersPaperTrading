import {InitHelper} from "../../Utils/Helpers/InitHelper.js";
import {UIHelper} from "../Helpers/UIHelper.js";
import {startInterval} from "../Helpers/IntervalHelper.js";
import {UIManager} from "../../Utils/Core/UIManager.js";
import {PNLService} from "./PNLService.js";
import {UIConfig} from "../Config/UIConfig.js"
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {ChromeHandler} from "../../ChromeHandler.js"

export class StateManager {
    constructor() {
        this.initializing = false;
        this.running = false;

        this.variables = null;
        this.pnlService = new PNLService(this);

        this.updateInterval = null;

        this.fetchingBalance = false;
        this.currentPreset = null;
        this.currentContract = null;

        this.scheduledBlockers = [];
    }

    async initialize() {
        try {
            if (this.initializing || this.running) return;
            console.log("[TrenchersPT] 🟢 Initializing dashboard...");
            this.initializing = true;

            InitHelper.loadSettings(UIConfig);

            await InitHelper.validateHealth(this);

            await InitHelper.validateVersion(this);

            await InitHelper.validateSession(this);
            await this.pnlService.start();

            UIHelper.clearUI();

            document.body.style.removeProperty("pointer-events");

            this.updateInterval = startInterval(this);

            this.initializing = false;
            this.running = true;
        } catch (err) {
            this.initializing = false;
            throw ErrorHandler.log(err);
        }
    }

    async disconnect() {
        console.log("[TrenchersPT] 🔴 Disconnecting dashboard...");

        document.body.style.pointerEvents = "none";

        clearInterval(this.updateInterval);
        this.updateInterval = null;

        this.currentContract = null;

        this.pnlService.stop();

        this.running = false;
    }

    async logout() {
        await this.disconnect();
        await ChromeHandler.sendMessageAsync("NO_SESSION");
    }
}
