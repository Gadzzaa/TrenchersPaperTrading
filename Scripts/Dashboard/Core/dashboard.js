import { UIHelper } from "../Helpers/UIHelper.js";
import { DashboardInit } from "./DashboardInit.js";
document.addEventListener("DOMContentLoaded", async () => {
  try {
    UIHelper.createButtons();
    UIHelper.createStorageEvents();
    UIHelper.createRuntimeEvents();

    currentPreset = getUsingPreset();
    if (currentPreset == null || currentPreset === "undefined")
      applyPreset("preset1");
  } catch (error) {
    console.error("[TrenchersPT] Initialization error:", error);
  }
});
