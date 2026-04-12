import {StateManager} from "./StateManager.js";
import {GlobalUIManager} from "../Core/GlobalUIManager.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js"
import {FooterHelper} from "../Helpers/FooterHelper.js";

let stateManager;
document.addEventListener("DOMContentLoaded", async () => {
    try {
        stateManager = new StateManager();
        GlobalUIManager.disableArrowKeys();
        GlobalUIManager.createButtons(stateManager)
        GlobalUIManager.createStorageEvents(stateManager);
        GlobalUIManager.createRuntimeEvents(stateManager);

        FooterHelper.focusDefaultButton();

        await stateManager.initialize();
    } catch (err) {
        const code = err?.code || err?.cause?.code;
        if (
            code === "INVALID_TOKEN" ||
            code === "INVALID_SESSION" ||
            code === "REFRESH_TOKEN_REQUIRED" ||
            code === "UNAUTHORIZED"
        ) {
            const loginPanel = document.getElementById("loginPanel");
            if (loginPanel) loginPanel.classList.remove("loginHidden");
            return;
        }
        ErrorHandler.show(err, {show: false}, {show: true, stateManager});
    }
});
