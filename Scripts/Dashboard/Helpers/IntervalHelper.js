import { updateBalanceUI } from "./BalanceUpdater.js";
import { MessageHandlers } from "./MessageHandlers.js";
import { ErrorHandler } from "../../ErrorHandling/Core/ErrorHandler.js";
import { AppError } from "../../ErrorHandling/Helpers/AppError.js";
import { PresetManager } from "../Core/PresetManager.js";

export function startInterval(stateManager) {
  stateManager.currentPreset = document.querySelector(".activePreset")?.id;

  return setInterval(async () => {
    if (stateManager.fetchingBalance) return;
    stateManager.fetchingBalance = true;
    try {
      checkPendingPresets(stateManager);
      updateCurrentPreset(stateManager);
      await updateCurrentContract(stateManager);
      await updateBalanceUI(false, stateManager);
    } catch (err) {
      ErrorHandler.log(err);
    } finally {
      stateManager.fetchingBalance = false;
    }
  }, 1000);
}

function checkPendingPresets(stateManager) {
  const pendingPresets = localStorage.getItem("pendingPresets");
  if (pendingPresets) {
    PresetManager.applyPreset(stateManager.currentPreset);
    localStorage.setItem("pendingPresets", false);
  }
}

function updateCurrentPreset(stateManager) {
  const newPreset = PresetManager.getUsingPreset();
  if (stateManager.currentPreset !== newPreset) {
    PresetManager.applyPreset(newPreset);
    stateManager.currentPreset = newPreset;
  }
}

async function updateCurrentContract(stateManager) {
  const newContract = await MessageHandlers.requestCurrentContract();
  if (stateManager.currentContract !== newContract) {
    stateManager.currentContract = newContract;
    await searchPosition(stateManager);
  }
}

async function searchPosition(stateManager) {
  if (!stateManager.currentContract)
    throw new AppError("No current contract found.", {
      code: "NOT_FOUND",
      meta: {
        stateManager,
      },
    });

  const storedPositions = localStorage.getItem("openPositions");
  if (!storedPositions) {
    console.warn("No open positions found in localStorage.");
    return;
  }

  const parsed = JSON.parse(storedPositions);
  if (!Array.isArray(parsed) || parsed.length < 1)
    throw new AppError("Parsing positions failed.", {
      code: "PARSE_ERROR",
      meta: {
        parsed,
        storedPositions,
      },
    });

  window.openPositions = parsed;

  const match = parsed.find((p) => p.pool === stateManager.currentContract);
  if (match) {
    console.log("Setting active token to:", match.pool);
    stateManager.pnlService.setActiveToken(match.pool);
  }
}
