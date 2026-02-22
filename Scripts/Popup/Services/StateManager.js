import {InitHelper} from "../../Utils/Helpers/InitHelper.js"
import {UIConfig} from "../Config/UIConfig.js"
import {UIHelper} from "../Helpers/UIHelper.js"
import {UIManager} from "../../Utils/Core/UIManager";

export class StateManager {
    constructor() {
        this.initializing = false;
        this.healthy = false;

        this.variables = null;
        this.dataManager = null;
    }

    async initialize() {
        if (this.initializing) return;
        this.initializing = true;

        UIHelper.clearInputFields();

        InitHelper.loadSettings(UIConfig);
        await InitHelper.validateHealth(this);
        await InitHelper.validateVersion(this)
        await InitHelper.validateSession(this);

        document.body.style.removeProperty("pointer-events");

        this.initializing = false;
        await UIManager.enableUI();
    }
}
