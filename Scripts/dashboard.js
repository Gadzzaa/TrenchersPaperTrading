import { applyPreset, getUsingPreset } from "./presetManager.js";

import { showNotification, getFromStorage, handleError } from "./utils.js";

import { Variables } from "./Account/Core/Variables.js";
import { DataManager } from "./Account/Core/DataManager.js";
import { ServerValidation } from "./Server/ServerValidation.js";
import { TransactionManager } from "./Transactions/Core/TransactionManager.js";

import { NotificationManager } from "./Utils/Core/NotificationManager.js";
import { StorageManager } from "./Utils/Core/StorageManager.js";
import { ErrorHandler } from "./ErrorHandling/Core/ErrorHandler.js";

import {
  setActiveToken,
  clearPositions,
  importTradeLog,
  connectWebSocket,
  disconnectWebSocket,
} from "./pnlHandler.js";

import {
  requestCurrentContract,
  requestHideApp,
  disableAllTradeButtons,
  enableAllTradeButtons,
  enableUI,
  disableUI,
} from "./utils.js";

let dataManager;
let variables;

let currentContract = null;
let currentPreset = null;
let ws = null;
let updateInterval = null;
let initializing = false;
let fetchingBalance = false;

async function initDashboard() {
  if (initializing) return; // prevent re-entrance
  initializing = true;

  console.log("[TrenchersPT] 🟢 Initializing dashboard...");

  clearInterval(updateInterval);
  updateInterval = setInterval(async () => {
    if (fetchingBalance) return; // prevent overlap
    fetchingBalance = true;

    try {
      currentPreset = document.querySelector(".activePreset")?.id;

      const pendingPresets = localStorage.getItem("pendingPresets");
      if (pendingPresets) {
        applyPreset(currentPreset);
        localStorage.setItem("pendingPresets", false);
      }

      const newPreset = getUsingPreset();
      if (currentPreset !== newPreset) {
        applyPreset(newPreset);
        currentPreset = newPreset;
      }

      const newContract = await requestCurrentContract();
      if (currentContract !== newContract) {
        currentContract = newContract;
        await searchPosition(currentContract);
      }

      await updateBalanceUI();
    } catch (err) {
      console.error("updateInterval error:", err);
    } finally {
      fetchingBalance = false;
    }
  }, 1000);

  await enableUI();
  initializing = false;
}

export async function disconnectDashboard() {
  console.log("[TrenchersPT] 🔴 Disconnecting dashboard...");

  document.body.style.pointerEvents = "none";

  updateInterval = null;

  currentContract = null;

  if (ws) {
    disconnectWebSocket();
    ws = null;
  }
}

async function logout() {
  disconnectDashboard();
  clearPositions();
  await disableUI("no-session");
}

function handleActionButtonClick(button) {
  return async () => {
    const actionButtons = document.querySelectorAll(
      "#buyButtons .buyButton, #sellButtons .sellButton",
    );

    try {
      if (document.body.classList.contains("edit-mode")) return;
      disableAllTradeButtons(actionButtons);
      // Implement the startLoadingDots functionality here

      const poolAddress = currentContract;
      const action = button.dataset.action;
      const dataAmount = parseFloat(button.dataset.amount);

      if (!poolAddress) throw new Error("No pool found.");
      if (!action) throw new Error("No action specified inside the button.");
      if (!dataAmount)
        throw new Error("No amount specified inside the button.");

      const transactionManager = new TransactionManager(
        { poolAddress: poolAddress, amount: dataAmount },
        variables,
      );

      if (action === "buy") {
        const result = await transactionManager.buyToken();
        if (!result?.success)
          throw new Error(result.error || "Unknown error occurred.");
        let solSpent = parseFloat(result.solSpent.toFixed(2));
        showNotification(
          `You bought ${solSpent} SOL worth of ${result.tokenData.symbol}!`,
          "success",
        );
        await importTradeLog(variables);
        setActiveToken(poolAddress);
      }
      if (action === "sell") {
        const result = await transactionManager.sellToken();
        if (!result?.success)
          throw new Error(result.error || "Unknown error occurred.");
        const solReceived = parseFloat(result.solReceived).toFixed(2);
        showNotification(`You sold for ${solReceived} SOL!`, "success");
        await importTradeLog(variables);
      }
    } catch (error) {
      handleError(error, "Trade action failed: ");
    } finally {
      await updateBalanceUI(true);
      // Implement the stopLoadingDots functionality here
      enableAllTradeButtons(actionButtons);
    }
  };
}

async function searchPosition(currentContract) {
  await importTradeLog(variables);
  if (!currentContract) throw new Error("No current contract found.");

  const storedPositions = localStorage.getItem("openPositions");
  if (!storedPositions) {
    console.warn("No open positions found in localStorage.");
    return;
  }

  const parsed = JSON.parse(storedPositions);
  if (!Array.isArray(parsed) || parsed.length < 1)
    throw new Error("Parsing positions failed.");

  window.openPositions = parsed;

  const match = parsed.find((p) => p.pool === currentContract);
  if (match) {
    console.log("Setting active token to:", match.pool);
    setActiveToken(match.pool);
  }
}

export async function updateBalanceUI(force = false) {
  const transactionManager = new TransactionManager({}, variables);
  const solBalance = document.getElementById("balanceValue");
  const cache = localStorage.getItem("cachedBalance");
  const lastUpdated = parseInt(
    localStorage.getItem("cachedBalanceTime") || "0",
    10,
  );
  const now = Date.now();

  const maxAge = 1000 * 60 * 10; // 5 mins
  if (!force && cache && now - lastUpdated < maxAge) {
    solBalance.innerText = parseFloat(cache).toFixed(2);
    return;
  }

  console.log("Fetching new balance from API...");

  const result = await transactionManager.getPortfolio();
  if (!result?.solBalance) {
    console.error("Failed to fetch balance:", result?.error || result);
    return;
  }
  const balance = parseFloat(result.solBalance).toFixed(2);
  solBalance.innerText = balance;
  localStorage.setItem("cachedBalance", balance);
  localStorage.setItem("cachedBalanceTime", Date.now().toString());
}
