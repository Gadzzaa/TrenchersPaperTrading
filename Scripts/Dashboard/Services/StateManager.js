import {InitHelper} from "../../Utils/Helpers/InitHelper.js";
import {UIHelper} from "../Helpers/UIHelper.js";
import {startInterval, syncDashboardData} from "../Helpers/IntervalHelper.js";
import {PNLService} from "./PNLService.js";
import {UIConfig} from "../Config/UIConfig.js"
import {API} from "../../Server/API.js"
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class StateManager {
    #initAttemptId = 0;

    constructor() {
        this.initializing = false;
        this.running = false;

        this.api = new API()
        this.pnlService = null;

        this.updateInterval = null;

        this.fetchingBalance = false;
        this.currentPreset = null;
        this.currentContract = null;

        this.activeDialog = null;
    }

    async initialize(force) {
        if (force) {
            this.stopDashboard();
        } else if ((this.initializing || this.running)) return;

        document.body.style.pointerEvents = "none";
        const attemptId = ++this.#initAttemptId
        console.log("[TrenchersPT] 🟢 Initializing dashboard...");
        this.initializing = true;

        const assertCurrent = () => {
            if (attemptId !== this.#initAttemptId) {
                throw new AppError("Initialization cancelled.", {
                    code: "INIT_CANCELLED",
                });
            }
        };

        try {
            InitHelper.loadSettings(UIConfig);

            await InitHelper.validateHealth();
            assertCurrent();

            await InitHelper.validateVersion();
            assertCurrent();

            await InitHelper.validateSession(this);
            assertCurrent();

            await InitHelper.validateWebsocketLimits(this);
            assertCurrent();

            const pnlService = new PNLService(this);
            this.pnlService = pnlService;

            await pnlService.start();
            assertCurrent();

            UIHelper.clearUI();

            await syncDashboardData(this);
            assertCurrent();

            this.updateInterval = startInterval(this);
            this.running = true;

            document.body.style.removeProperty("pointer-events");
        } catch (err) {
            if (attemptId !== this.#initAttemptId) {
                throw new AppError("Initialization cancelled.", {
                    code: "INIT_CANCELLED",
                    cause: err,
                });
            }

            throw err
        } finally {
            if (attemptId === this.#initAttemptId)
                this.initializing = false;
        }
    }

    stopDashboard() {
        this.#teardownRoutine();
    }

    endDashboardSession() {
        this.#teardownRoutine();
        this.#clearPersistentSessionData();
    }

    async logout() {
        this.endDashboardSession();
        await this.api.logout();
    }

    #teardownRoutine() {
        ++this.#initAttemptId;

        this.initializing = false;
        this.running = false;

        clearInterval(this.updateInterval);
        this.updateInterval = null;

        this.pnlService?.stop();
        this.pnlService = null;

        this.currentContract = null;
        document.getElementById("balanceValue")?.replaceChildren()
        document.body.style.pointerEvents = "none";
        localStorage.removeItem("cachedBalance");
        localStorage.removeItem("cachedBalanceTime");
    }

    #clearPersistentSessionData() {
        localStorage.removeItem("openPositions");
        localStorage.removeItem("pnlDataArray");
    }
}
