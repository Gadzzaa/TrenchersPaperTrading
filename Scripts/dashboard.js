import { applyPreset, getActivePreset } from "./presetManager.js";

import { showNotification, showSpinner, hideSpinner } from "./utils.js";

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
  removePosition,
  clearPositions,
} from "./pnlHandler.js";

import {
  requestCurrentContract,
  requestSymbol,
  requestPrice,
} from "./utils.js";

// LOCAL ONLY:
import { login, register } from "./API.js";

import CONFIG, { USE_LOCAL } from "../config.js";

let currentContract = null;
let currentPreset = null;

document.addEventListener("DOMContentLoaded", async () => {
  // PROD ONLY:
  if (USE_LOCAL) {
    //localStorage.clear();
    //register("TestingUser", "Parola");
    login("TestingUser", "Parola");
  }

  const sessionToken = localStorage.getItem("sessionToken");
  const username = localStorage.getItem("username");

  if (!sessionToken) {
    console.warn("Session token not found.");
    clearPositions();
    // TODO: Lock dashboard until session is valid
    return;
  }

  const isSessionValid = await checkSession();
  if (!isSessionValid) {
    console.warn("Session token is invalid.");
    clearPositions();
    localStorage.removeItem("sessionToken");
    // TODO: Lock dashboard until session is valid
    return;
  }

  currentPreset = getActivePreset();
  if (currentPreset === null) applyPreset("preset1");
  else applyPreset(currentPreset);

  currentContract = await requestCurrentContract();

  setInterval(async () => {
    const pendingPresets = localStorage.getItem("pendingPresets");
    if (pendingPresets) {
      applyPreset(currentPreset);
      localStorage.setItem("pendingPresets", false);
    }

    const newPreset = getActivePreset();
    if (currentPreset !== newPreset) {
      applyPreset(currentPreset);
      currentPreset = newPreset;
    }

    const newContract = await requestCurrentContract();
    if (currentContract !== newContract) {
      currentContract = newContract;
      searchPosition(currentContract);
    }

    await updateBalanceUI();
  }, 1000);

  const actionButtons = document.querySelectorAll(
    "#buyButtons .buyButton, #sellButtons .sellButton",
  );
  for (const button of actionButtons) {
    button.addEventListener("click", handleActionButtonClick(button));
  }
});
function handleActionButtonClick(button) {
  return async () => {
    try {
      if (window.editMode === true) return;
      showSpinner();
      button.disabled = true;

      const tokenMint = currentContract;
      const action = button.dataset.action;
      const solSpent = parseFloat(button.dataset.amount);
      const symbol = await requestSymbol();
      const price = await requestPrice();

      if (price == null) throw new Error("Token price is not an integer.");
      if (!tokenMint) throw new Error("No contract loaded.");
      if (!action) throw new Error("No action specified inside the button.");
      if (!solSpent) throw new Error("No amount specified inside the button.");
      if (!symbol) throw new Error("No symbol found on the website.");

      if (action === "buy") {
        const result = await buyToken(tokenMint, solSpent, price);
        if (!result) throw new Error("Failed to buy token.");
        showNotification(
          `✅ You bought ${parseFloat(result.tokensReceived).toFixed(2)} ${symbol}!`,
          "success",
        );
        await recordBuy(tokenMint, parseFloat(price), solSpent);
      }
      if (action === "sell") {
        const result = await sellByPercentage(tokenMint, solSpent, price);
        if (!result) throw new Error("Failed to sell token.");
        showNotification(
          `✅ You sold ${parseFloat(result.tokensSold).toFixed(2)} ${symbol} for ${parseFloat(result.solReceived).toFixed(2)} SOL!`,
          "success",
        );
        await recordSell(
          tokenMint,
          parseFloat(price),
          result.tokensSold,
          solSpent,
        );
      }
    } catch (error) {
      showNotification("❌ " + error, "error");
      console.error("Error:", error);
    } finally {
      await updateBalanceUI(true);
      hideSpinner();
      button.disabled = false;
    }
  };
}

function searchPosition(currentContract) {
  loadPositions();
  const storedPositions = localStorage.getItem("openPositions");
  if (storedPositions && currentContract) {
    const parsed = JSON.parse(storedPositions);
    if (Array.isArray(parsed) && parsed.length > 0) {
      window.openPositions = parsed;

      const match = parsed.find(
        (p) => p.mint === currentContract && p.quantity > 0,
      );
      if (match) {
        setActiveToken(match.mint, match.entryPrice, match.quantity);
      } else {
        console.warn(
          `[dashboard.js] Stored mint ${currentContract} not found or has 0 quantity.`,
        );
      }
    }
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
  if (result && result.solBalance) {
    const balance = parseFloat(result.solBalance).toFixed(2);
    solBalance.innerText = balance;
    localStorage.setItem("cachedSolBalance", balance);
    localStorage.setItem("cachedSolBalanceTime", Date.now().toString());
  } else {
    console.error("Failed to fetch balance");
  }
}
