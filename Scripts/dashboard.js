import { applyPreset, getUsingPreset } from "./presetManager.js";

import { showNotification, getFromStorage, handleError } from "./utils.js";

import { Variables } from "./Account/Core/Variables.js";
import { DataManager } from "./Account/Core/DataManager.js";
import { ServerValidation } from "./Server/ServerValidation.js";
import { TransactionManager } from "./Transactions/Core/TransactionManager.js";

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
  showButtonLoading,
  enableUI,
  disableUI,
  internetConnection,
  managedSetInterval,
  clearAllTimers,
} from "./utils.js";

let dataManager;
let variables;

let currentContract = null;
let currentPreset = null;
let ws = null;
let updateInterval = null;
let initializing = false;
let fetchingBalance = false;

// Event listener tracking for cleanup
let storageChangeListener = null;
let runtimeMessageListener = null;

const settings = [
  {
    key: "theme",
    default: "dark",
    apply: (value) => {
      document.documentElement.setAttribute("data-theme", value);
    },
  },
  {
    key: "animation",
    default: 3,
    apply: (value) => {
      document.documentElement.style.setProperty(
        "--anim-time",
        `${value / 10}s`,
      );
    },
  },
];

async function initDashboard() {
  if (initializing) return; // prevent re-entrance
  initializing = true;

  console.log("[TrenchersPT] 🟢 Initializing dashboard...");

  settings.forEach(({ key, default: def, apply }) => {
    chrome.storage.local.get(key, ({ [key]: value }) => {
      if (value === undefined) value = def;
      apply(value);
    });
  });

  let healthy = false;
  chrome.runtime.sendMessage({ type: "HEALTH_PING" }, async (response) => {
    healthy = response.status;
    if (healthy == null) return;
    if (healthy == false) {
      console.warn("Health check failed — retrying later.");
      await disableUI("no-internet");
      initializing = false;
      return;
    }
  });
  const validVersion = await ServerValidation.isLatestVersion();
  if (!validVersion) {
    console.warn("Outdated version detected.");
    await disableUI("outdated");
    initializing = false;
    return;
  }

  let sessionToken = await getFromStorage("sessionToken");
  if (!sessionToken) {
    await disableUI("no-session");
    console.warn("No session token found in storage.");
    initializing = false;
    return;
  }
  variables = new Variables({ sessionToken });
  dataManager = new DataManager(variables);

  const isSessionValid = await dataManager.checkSession();
  if (!isSessionValid) {
    console.warn("Session invalid — showing login screen.");
    clearPositions();
    await disableUI("no-session");
    initializing = false;
    return;
  }

  if (!ws)
    ws = await connectWebSocket().catch((error) => {
      throw new Error("WebSocket connection failed: " + error.message);
    });

  let boughtText = document.getElementById("boughtText");
  let soldText = document.getElementById("soldText");
  let holdText = document.getElementById("holdText");
  let pnlText = document.getElementById("pnlText");

  boughtText.innerText = "0.0";
  soldText.innerText = "0.0";
  holdText.innerText = "0.0";
  pnlText.innerText = "+0.0 (0.00%)";

  document.body.style.removeProperty("pointer-events");

  clearInterval(updateInterval);
  updateInterval = managedSetInterval(async () => {
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

  // Clear all managed timers
  clearAllTimers();

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

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const actionButtons = document.querySelectorAll(
      "#buyButtons .buyButton, #sellButtons .sellButton",
    );
    for (const button of actionButtons) {
      button.addEventListener("click", handleActionButtonClick(button));
    }

    currentPreset = getUsingPreset();
    if (currentPreset == null || currentPreset === "undefined") {
      applyPreset("preset1");
    } else applyPreset(currentPreset);

    const closeButton = document.getElementById("Close");
    closeButton.addEventListener("click", () => {
      requestHideApp();
    });

    // Remove existing listeners before adding new ones to prevent duplicates
    if (storageChangeListener) {
      chrome.storage.onChanged.removeListener(storageChangeListener);
    }

    storageChangeListener = (changes, area) => {
      if (area === "local" && changes.theme) {
        document.documentElement.setAttribute(
          "data-theme",
          changes.theme.newValue,
        );
      }
      if (area === "local" && changes.animation) {
        document.documentElement.style.setProperty(
          "--anim-time",
          `${changes.animation.newValue / 10}s`,
        );
      }
      if (area === "local" && changes.pnlSlider) {
        changeDelay(changes.updateDelay.newValue);
      }
    };
    chrome.storage.onChanged.addListener(storageChangeListener);

    // Remove existing listeners before adding new ones to prevent duplicates
    if (runtimeMessageListener) {
      chrome.runtime.onMessage.removeListener(runtimeMessageListener);
    }

    runtimeMessageListener = (message, sender, sendResponse) => {
      if (message.type === "initDashboard") {
        console.log("User registered, initializing dashboard...");
        initDashboard();
      }
      if (message.type === "logoutDashboard") {
        console.log("User logged out, disabling dashboard...");
        logout();
      }
      if (message.type === "STATUS_UPDATE") {
        console.log("Health status update received:", message.status);
        if (!message.status) {
          disconnectDashboard();
          disableUI("no-internet");
        } else initDashboard();
      }
    };
    chrome.runtime.onMessage.addListener(runtimeMessageListener);

    await initDashboard();
  } catch (error) {
    console.error("[TrenchersPT] Initialization error:", error);
  }
});

function handleActionButtonClick(button) {
  return async () => {
    const actionButtons = document.querySelectorAll(
      "#buyButtons .buyButton, #sellButtons .sellButton",
    );

    try {
      if (document.body.classList.contains("edit-mode")) return;
      disableAllTradeButtons(actionButtons);
      showButtonLoading(button);

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
  if (!internetConnection()) {
    disconnectDashboard();
    return;
  }
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
