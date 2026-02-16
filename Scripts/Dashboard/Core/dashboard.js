import { UIHelper } from "../Helpers/UIHelper.js";
import { StateManager } from "./StateManager.js";
import { ErrorHandler } from "../../ErrorHandling/Core/ErrorHandler.js";
document.addEventListener("DOMContentLoaded", async () => {
  try {
    let stateManager = new StateManager();
    UIHelper.createButtons(stateManager);
    UIHelper.createStorageEvents(stateManager);
    UIHelper.createRuntimeEvents(stateManager);

    currentPreset = getUsingPreset();
    if (currentPreset == null || currentPreset === "undefined")
      applyPreset("preset1");

    await stateManager.initialize();
  } catch (error) {
    ErrorHandler.show(error);
  }
});
