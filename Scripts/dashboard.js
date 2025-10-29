import { applyPreset, getUsingPreset } from "./presetManager.js";

import { showNotification } from "./utils.js";

import {
  healthCheck,
  checkSession,
  isLatestVersion,
  getPortfolio,
  buyToken,
  sellByPercentage,
} from "./API.js";

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
  getFromStorage,
  internetConnection,
  managedSetInterval,
  managedSetTimeout,
  clearAllTimers,
} from "./utils.js";

let currentContract = null;
let currentPreset = null;
let ws = null;
let updateInterval = null;
let healthCheckInterval = null;
let initializing = false;
let fetchingBalance = false;
let reconnectTimeout = null;

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

  const healthy = await healthCheck();
  if (!healthy) {
    console.warn("Health check failed — retrying later.");
    await disableUI("no-internet");
    scheduleReconnect();
    initializing = false;
    return;
  }

  clearInterval(healthCheckInterval);
  healthCheckInterval = managedSetInterval(async () => {
    const healthy = await healthCheck();
    if (!healthy) {
      console.warn("Lost connection — disconnecting dashboard.");
      disconnectDashboard();
    }
  }, 5000);

  const validVersion = await isLatestVersion();
  if (!validVersion) {
    console.warn("Outdated version detected.");
    await disableUI("outdated");
    initializing = false;
    return;
  }

  const isSessionValid = await checkSession();
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

export async function disconnectDashboard(logout = false) {
  console.log("[TrenchersPT] 🔴 Disconnecting dashboard...");

  document.body.style.pointerEvents = "none";

  // Clear all managed timers
  clearAllTimers();
  
  updateInterval = null;
  healthCheckInterval = null;
  reconnectTimeout = null;

  currentContract = null;

  if (ws) {
    disconnectWebSocket();
    ws = null;
  }

  if (!logout) scheduleReconnect();
}

function scheduleReconnect() {
  if (reconnectTimeout) return;
  reconnectTimeout = managedSetTimeout(() => {
    reconnectTimeout = null;
    initDashboard();
  }, 2000);
}

async function logout() {
  disconnectDashboard(true);
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

      if (action === "buy") {
        const result = await buyToken(poolAddress, dataAmount);
        if (!result?.success)
          throw new Error(result.error || "Unknown error occurred.");
        let solSpent = parseFloat(result.solSpent.toFixed(2));
        showNotification(
          `You bought ${solSpent} SOL worth of ${result.tokenData.symbol}!`,
          "success",
        );
        await importTradeLog();
        setActiveToken(poolAddress);
      }
      if (action === "sell") {
        const result = await sellByPercentage(poolAddress, dataAmount);
        if (!result?.success)
          throw new Error(result.error || "Unknown error occurred.");
        const solReceived = parseFloat(result.solReceived).toFixed(2);
        showNotification(`You sold for ${solReceived} SOL!`, "success");
        await importTradeLog();
      }
    } catch (error) {
      showNotification(error, "error");
    } finally {
      await updateBalanceUI(true);
      enableAllTradeButtons(actionButtons);
    }
  };
}

async function searchPosition(currentContract) {
  await importTradeLog();
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
  const result = await getPortfolio();
  if (!result?.solBalance) {
    console.error("Failed to fetch balance:", result?.error || result);
    return;
  }
  const balance = parseFloat(result.solBalance).toFixed(2);
  solBalance.innerText = balance;
  localStorage.setItem("cachedBalance", balance);
  localStorage.setItem("cachedBalanceTime", Date.now().toString());
}
