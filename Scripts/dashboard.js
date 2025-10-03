import { applyPreset, getUsingPreset } from "./presetManager.js";

import { showNotification } from "./utils.js";

import {
  checkSession,
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
} from "./utils.js";

let currentContract = null;
let currentPreset = null;
let ws = null;
let updateInterval = null;

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

async function init() {
  settings.forEach(({ key, default: def, apply }) => {
    chrome.storage.local.get(key, ({ [key]: value }) => {
      if (value === undefined) value = def;
      apply(value);
    });
  });

  const isSessionValid = await checkSession();
  if (!isSessionValid) {
    clearPositions();
    disableUI();
    return;
  }

  enableUI();

  document.body.style.removeProperty("pointer-events");
  if (!ws)
    ws = connectWebSocket().catch((error) => {
      throw new Error("WebSocket connection failed: " + error.message);
    });

  updateInterval = setInterval(async () => {
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
    console.log("Current Contract:", newContract);
    if (currentContract !== newContract) {
      currentContract = newContract;
      searchPosition(currentContract);
    }

    await updateBalanceUI();
  }, 1000);
}

async function logout() {
  document.body.style.pointerEvents = "none";
  ws = disconnectWebSocket();
  clearInterval(updateInterval);
  clearPositions();
  disableUI();
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

    await init();

    chrome.storage.onChanged.addListener((changes, area) => {
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
    });
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "initDashboard") {
        console.log("User registered, initializing dashboard...");
        init();
      }
      if (message.type === "logoutDashboard") {
        console.log("User logged out, disabling dashboard...");
        logout();
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification("[dashboard.js] " + message, "error");
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

  const result = await getPortfolio();
  if (!result?.solBalance) {
    console.error("Failed to fetch balance:", result?.error || result);
    return;
  }
  const balance = parseFloat(result.solBalance).toFixed(2);
  solBalance.innerText = balance;
  localStorage.setItem("cachedSolBalance", balance);
  localStorage.setItem("cachedSolBalanceTime", Date.now().toString());
}
