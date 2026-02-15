import { updateBalanceUI } from "./BalanceUpdater.js";
import { MessageHandlers } from "./MessageHandlers.js";

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
      console.error("[TrenchersPT] Error in interval:", err);
    } finally {
      stateManager.fetchingBalance = false;
    }
  }, 1000);
}

function checkPendingPresets(stateManager) {
  const pendingPresets = localStorage.getItem("pendingPresets");
  if (pendingPresets) {
    applyPreset(stateManager.currentPreset);
    localStorage.setItem("pendingPresets", false);
  }
}

function updateCurrentPreset(stateManager) {
  const newPreset = getUsingPreset();
  if (stateManager.currentPreset !== newPreset) {
    applyPreset(newPreset);
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
  await importTradeLog(stateManager.variables);
  if (!stateManager.currentContract)
    throw new Error("No current contract found.");

  const storedPositions = localStorage.getItem("openPositions");
  if (!storedPositions) {
    console.warn("No open positions found in localStorage.");
    return;
  }

  const parsed = JSON.parse(storedPositions);
  if (!Array.isArray(parsed) || parsed.length < 1)
    throw new Error("Parsing positions failed.");

  window.openPositions = parsed;

  const match = parsed.find((p) => p.pool === stateManager.currentContract);
  if (match) {
    console.log("Setting active token to:", match.pool);
    setActiveToken(match.pool);
  }
}
