import {
  showNotification,
  enableUI,
  disableUI,
  getFromStorage,
  setToStorage,
} from "./utils.js";
import { getDebugMode } from "../config.js";
import CONFIG from "../config.js";
import { clearPositions } from "./pnlHandler.js";
import { updateBalanceUI } from "./dashboard.js";
const API_BASE_URL = CONFIG.API_BASE_URL;
const maxAttempts = 3;

//TODO: Fix backend API
const slippagePercentage = 0;
const feeAmount = 0;

// SessionChecker.js
export async function checkSession() {
  try {
    let response;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + "/api/check-session", {
          method: "GET",
          headers: await getAuthHeaders(),
          signal: controller.signal,
        });
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
        clearTimeout(timeout);
      } catch (error) {
        if (attempt === maxAttempts)
          throw new Error("Failed to check session: " + error);
      }
    }
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
  }
  return false;
}

// PopupData.js
export async function fetchPopupData() {
  try {
    let response;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + "/api/popupData", {
          method: "GET",
          headers: await getAuthHeaders(),
          signal: controller.signal,
        });
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
        clearTimeout(timeout);
      } catch (error) {
        if (attempt === maxAttempts)
          throw new Error("Failed to fetch popup data: " + error.message);
      }
    }
    const data = await response.json();
    if (!data) throw new Error("No data received from server");
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
  }
}

// BuyHandler.js
export async function buyToken(
  tokenMint,
  solAmount,
  tokenPrice,
  liquidity,
  slippage = slippagePercentage,
  fee = feeAmount,
  tokenData,
) {
  try {
    const payload = {
      tokenMint,
      solAmount,
      tokenPrice,
      liquidity,
      slippage,
      fee,
      tokenData,
    };
    let response;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + "/api/buy", {
          method: "POST",
          headers: await getAuthHeaders(),
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
        clearTimeout(timeout);
      } catch (error) {
        if (attempt === maxAttempts)
          throw new Error("Buy failed with error: " + error.message);
      }
    }

    const result = await response.json();
    if (!result?.success)
      throw new Error(result.error || "Unknown error occured.");
    return {
      success: result.success,
      tokensReceived: result.tokensReceived,
      solSpent: result.solSpent,
      effectivePrice: result.effectivePrice,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errMsg = getDebugMode() ? "[API.js] " + message : message;
    return { error: errMsg };
  }
}

// SellHandler.js
export async function sellByPercentage(tokenMint, percentage, price) {
  try {
    const portfolio = await getPortfolio();
    if (!portfolio?.tokens)
      throw new Error(portfolio.error || "No tokens found in portfolio.");

    const totalAmount = portfolio.tokens[tokenMint];
    if (!totalAmount) throw new Error("No tokens found for this mint.");

    const amountToSell = parseFloat(
      (totalAmount * (percentage / 100)).toFixed(9),
    );

    if (amountToSell <= 0) throw new Error("No tokens to sell.");

    const result = await sellToken(tokenMint, amountToSell, price);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errMsg = getDebugMode() ? "[API.js] " + message : message;
    return { error: errMsg };
  }
}

// PortfolioHandler.js
export async function getPortfolio() {
  try {
    let response;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + `/api/portfolio`, {
          method: "GET",
          headers: await getAuthHeaders(),
          signal: controller.signal,
        });
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
        clearTimeout(timeout);
      } catch (error) {
        if (attempt === maxAttempts)
          throw new Error("Failed to fetch portfolio: " + error.message);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: getDebugMode() ? "[API.js] " + message : message };
  }
}

// ResetHandler.js
export async function resetAccount(amount) {
  try {
    let response;
    if (isNaN(amount) || amount < 1)
      throw new Error("Invalid amount — must be a number ≥ 1");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      response = await fetch(API_BASE_URL + `/api/reset`, {
        method: "PATCH",
        headers: await getAuthHeaders(),
        body: json.stringify({ amount }),
        signal: controller.signal,
      });
      if (!response?.ok)
        throw new Error(`Server responded with status ${response.status}`);
      clearTimeout(timeout);
    } catch (error) {
      if (attempt === maxAttempts)
        throw new Error("Failed to fetch portfolio: " + error.message);
    }
    clearPositions();
    if (document.querySelector("#TrenchersPaperTrading") !== null)
      updateBalanceUI(true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? `[API.js] ${message}` : message, "error");
  }
}

// LoginHandler.js
export async function login(username, password) {
  try {
    let response;
    if (!username || !password)
      throw new Error("Username and password are required.");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + "/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          signal: controller.signal,
        });
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
        clearTimeout(timeout);
      } catch (error) {
        if (attempt === maxAttempts)
          throw new Error("Login failed with error: " + error.message);
      }
    }
    const result = await response.json();
    if (!result?.token)
      throw new Error("No token received from server: " + result.error);
    if (!result?.username)
      throw new Error("No username received from server: " + result.error);

    await setToStorage("sessionToken", result.token);
    await setToStorage("username", result.username);
    enableUI();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
  }
}

// RegisterHandler.js
export async function register(username, password) {
  try {
    let response;
    if (!username || !password)
      throw new Error("Username and password are required.");
    if (password.length < 6)
      throw new Error("Password must be at least 6 characters.");

    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch("http://localhost:3000/api/create-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          signal: controller.signal,
        });
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
        clearTimeout(timeout);
      } catch (error) {
        if (attempt === 1)
          throw new Error("Registration failed with error: " + error.message);
      }
    }
    const result = await response.json();
    if (!result?.token)
      throw new Error("No token received from server: " + result.error);
    if (!result?.username)
      throw new Error("No username received from server: " + result.error);

    await setToStorage("username", result.username);
    await setToStorage("sessionToken", result.token);
    enableUI();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
  }
}

// BACKEND FUNCTIONS
async function sellToken(
  tokenMint,
  tokenAmount,
  tokenPrice,
  liquidity,
  slippage = slippagePercentage,
  fee = feeAmount,
  tokenData,
) {
  const payload = {
    tokenMint,
    tokenAmount,
    tokenPrice,
    liquidity,
    slippage,
    fee,
    tokenData,
  };
  let response;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      response = await fetch(API_BASE_URL + "/api/sell", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response?.ok) {
        return {
          error: "Server responded with status " + response.status,
        };
      }
      clearTimeout(timeout);
    } catch (error) {
      if (attempt === maxAttempts) return { error: error.message }; // Simplified since it will pass through sellByPercentage
    }
  }

  const result = await response.json();
  if (!result?.success)
    throw new Error(result.error || "Unknown error occured.");

  return {
    success: result.success,
    solReceived: result.solReceived,
    tokensSold: result.tokensSold,
    effectivePrice: result.effectivePrice,
  };
}

async function getAuthHeaders() {
  const sessionToken = await getFromStorage("sessionToken");
  if (!sessionToken) {
    throw new Error("No sessionToken found. Please log in again.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionToken}`,
  };
}
