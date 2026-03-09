import {InitHelper} from "../../Utils/Helpers/InitHelper.js"
import {UIConfig} from "../Config/UIConfig.js"
import {UIHelper} from "../Helpers/UIHelper.js"
import {UIManager} from "../../Utils/Core/UIManager.js";
import {AccountLoader} from "../Core/AccountLoader.js";
import {FooterHelper} from "../Helpers/FooterHelper.js";

export class StateManager {
    constructor() {
        this.initializing = false;
        this.healthy = false;

        this.variables = null;

        this.tokens = [];

        this.isPremium = false;

        this.resetsTimer = null;

        this.scheduledDialogs = [];
    }

    async initialize() {
        if (this.initializing) return;
        this.initializing = true;

        UIHelper.clearInputFields();

        InitHelper.loadSettings(UIConfig);
       
        //TODO: reorder those, using this only for checking
        await InitHelper.validateVersion(this)
        await InitHelper.validateHealth(this);

        document.body.style.removeProperty("pointer-events");

        await InitHelper.validateSession(this);

        await AccountLoader.loadData(this);

        this.initializing = false;
        await UIManager.enableUI();
    }

    clearUI() {
        let tokenListContainer = document.getElementById("tokenList");

        tokenListContainer.innerHTML = '';
        this.tokens && (this.tokens.length = 0);

        this.resetsTimer && clearInterval(this.resetsTimer);
        FooterHelper.focusDefaultButton();
    }
}
