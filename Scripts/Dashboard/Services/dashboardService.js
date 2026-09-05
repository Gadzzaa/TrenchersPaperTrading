import {UIHelper} from "../Helpers/UIHelper.js";
import {StateManager} from "./StateManager.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {PresetManager} from "../Core/PresetManager.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        let stateManager = new StateManager();
        UIHelper.createButtons(stateManager);
        UIHelper.createStorageEvents(stateManager);
        UIHelper.createRuntimeEvents(stateManager);
        PresetManager.initUI(stateManager);

        await stateManager.initialize();
    } catch (error) {
        if (
            error instanceof AppError &&
            (error.code === "INIT_CANCELLED" || error.code === "CONNECTION_CANCELLED")
        )
            return;

        ErrorHandler.show(error);
    }
});
