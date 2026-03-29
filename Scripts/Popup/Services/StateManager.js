import {InitHelper} from "../../Utils/Helpers/InitHelper.js"
import {UIConfig} from "../Config/UIConfig.js"
import {UIHelper} from "../Helpers/UIHelper.js"
import {AccountLoader} from "../Core/AccountLoader.js";
import {FooterHelper} from "../Helpers/FooterHelper.js";

export class StateManager {
    constructor() {
        this.initializing = false;
        this.variables = null;

        this.tokens = [];

        this.isPremium = false;

        this.resetsTimer = null;

        this.scheduledDialogs = [];
        this.runningDialog = null;
    }

    async initialize(force = false) {
        if (this.initializing && !force) return;
        this.initializing = true;

        UIHelper.clearInputFields();

        InitHelper.loadSettings(UIConfig);

        await InitHelper.validateHealth(this);
        await InitHelper.validateVersion(this)

        document.body.style.removeProperty("pointer-events");

        await InitHelper.validateSession(this);

        await AccountLoader.loadData(this);

        this.initializing = false;
    }

    disconnect() {
        this.variables = null;
        this.isPremium = false;
        this.clearUI();
    }

    clearUI() {
        let tokenListContainer = document.getElementById("tokenList");

        tokenListContainer.innerHTML = '';
        this.tokens && (this.tokens.length = 0);

        this.resetsTimer && clearInterval(this.resetsTimer);
        FooterHelper.focusDefaultButton();
    }
}
