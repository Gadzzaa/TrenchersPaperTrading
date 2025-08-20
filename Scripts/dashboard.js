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
  recordBuy,
  recordSell,
  loadPositions,
  clearPositions,
  refreshInterval,
} from "./pnlHandler.js";

import {
  requestCurrentContract,
  requestSymbol,
  requestPrice,
  disableAllTradeButtons,
  enableAllTradeButtons,
  showButtonLoading,
  enableUI,
  disableUI,
  getFromStorage,
} from "./utils.js";

// LOCAL ONLY:
import { login, register } from "./API.js";

import { USE_LOCAL } from "../config.js";

let currentContract = null;
let currentPreset = null;

async function init() {
  if (!location.pathname.endsWith("dashboard.html")) return;

  chrome.storage.local.get("theme", ({ theme }) => {
    if (!theme) theme = "dark";
    document.documentElement.setAttribute("data-theme", theme);
  });

  chrome.storage.local.get("animation", ({ animation }) => {
    if (!animation) animation = 3;
    document.documentElement.style.setProperty(
      "--anim-time",
      `${animation / 10}s`,
    );
  });

  if (USE_LOCAL) {
    login("TestingUser", "Parola"); // TODO: remove this line in production
  }

  const isSessionValid = await checkSession();
  if (!isSessionValid) {
    clearPositions();
    localStorage.removeItem("sessionToken");
    disableUI();
    throw new Error("Session token is invalid.");
  }

  currentPreset = getUsingPreset();
  if (currentPreset == null || currentPreset === "undefined") {
    applyPreset("preset1");
  } else applyPreset(currentPreset);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const actionButtons = document.querySelectorAll(
      "#buyButtons .buyButton, #sellButtons .sellButton",
    );

    await init();

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.theme) {
        document.documentElement.setAttribute(
          "data-theme",
          changes.theme.newValue,
        );
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.animation) {
        document.documentElement.style.setProperty(
          "--anim-time",
          `${changes.animation.newValue / 10}s`,
        );
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.pnlSlider) {
        changeDelay(changes.updateDelay.newValue);
      }
    });

    for (const button of actionButtons) {
      button.addEventListener("click", handleActionButtonClick(button));
    }

    setInterval(async () => {
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
        searchPosition(currentContract);
      }

      await updateBalanceUI();
    }, 1000);
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

      const tokenMint = currentContract;
      const action = button.dataset.action;
      const dataAmount = parseFloat(button.dataset.amount);
      const price = parseFloat(await requestPrice());
      const symbol = await requestSymbol();

      if (!tokenMint) throw new Error("No CA loaded.");
      if (!action) throw new Error("No action specified inside the button.");
      if (!dataAmount)
        throw new Error("No amount specified inside the button.");
      if (!price) throw new Error("Token price not found.");
      if (!symbol) throw new Error("Symbol not found.");

      if (action === "buy") {
        const result = await buyToken(tokenMint, dataAmount, price);
        if (!result?.success)
          throw new Error(result.error || "Unknown error occurred.");
        let solSpent =
          parseFloat(result.solSpent) - parseFloat(result.fees.protocol);
        solSpent = parseFloat(solSpent.toFixed(2));
        showNotification(
          `You bought ${solSpent} SOL worth of ${symbol}!`,
          "success",
        );
        await recordBuy(tokenMint, price, solSpent);
      }
      if (action === "sell") {
        const result = await sellByPercentage(tokenMint, dataAmount, price);
        if (!result?.success)
          throw new Error(result.error || "Unknown error occurred.");
        const solReceived = parseFloat(result.solReceived).toFixed(2);
        showNotification(
          `You sold ${symbol} for ${solReceived} SOL!`,
          "success",
        );
        await recordSell(tokenMint, parseFloat(solReceived), dataAmount); // account for fees
        //await recordSell(tokenMint, price, dataAmount);
      }
    } catch (error) {
      showNotification(error, "error");
    } finally {
      await updateBalanceUI(true);
      enableAllTradeButtons(actionButtons);
    }
  };
}

function searchPosition(currentContract) {
  loadPositions();
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

  const match = parsed.find((p) => p.mint === currentContract);
  if (match) {
    setActiveToken(match.mint);
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

  const maxAge = 1000 * 60 * 5; // 5 mins
  if (!force && cache && now - lastUpdated < maxAge) {
    solBalance.innerText = parseFloat(cache).toFixed(2);
    return;
  }

  const result = await getPortfolio();
  if (!result?.solBalance) {
    showNotification(result.error || "Failed to fetch balance.", "error");
    return;
  }
  const balance = parseFloat(result.solBalance).toFixed(2);
  solBalance.innerText = balance;
  localStorage.setItem("cachedSolBalance", balance);
  localStorage.setItem("cachedSolBalanceTime", Date.now().toString());
}
