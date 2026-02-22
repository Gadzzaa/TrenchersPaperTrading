import {StateManager} from "./StateManager";
import {GlobalUIManager} from "../Core/GlobalUIManager";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js"
import {FooterHelper} from "../Helpers/FooterHelper";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        let stateManager = new StateManager();
        GlobalUIManager.disableArrowKeys();
        GlobalUIManager.createButtons(stateManager)
        GlobalUIManager.createStorageEvents(stateManager);
        GlobalUIManager.createRuntimeEvents(stateManager);

        FooterHelper.focusDefaultButton();

        await stateManager.initialize();
    } catch (err) {
        ErrorHandler.show(err);
    }
});
