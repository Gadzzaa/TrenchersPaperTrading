import {
  showNotification,
  enableUI,
  disableUI,
  getFromStorage,
  setToStorage,
  removeFromStorage,
} from "./utils.js";
import { getDebugMode } from "../config.js";
import CONFIG from "../config.js";
import {
  clearPositions,
  setPnlData,
  watchPool,
  unwatchPool,
} from "./pnlHandler.js";
const API_BASE_URL = CONFIG.API_BASE_URL;
const maxAttempts = 3;

//TODO: Fix backend API
const slippagePercentage = 0;
const feeAmount = 0;

// SessionChecker.js
export async function checkSession() {
  try {
    const response = await fetch(API_BASE_URL + "/api/check-session", {
      method: "GET",
      headers: await getAuthHeaders(),
    });
    if (response.status >= 500)
      throw new Error(
        "Server is currently unreachable. Please check your connection or try again later.",
      );
    if (!response?.ok) return false;
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(
      getDebugMode() ? "[API.js] " + message : message,
      "error",
      false,
    );
    return false;
  }
}

// PNLHandler.js
export async function getTradeLog() {
  try {
    const response = await fetch(API_BASE_URL + "/api/tradeLog", {
      method: "GET",
      headers: await getAuthHeaders(),
    });
    if (response.status >= 500)
      throw new Error(
        "Server is currently unreachable. Please check your connection or try again later.",
      );
    if (!response?.ok)
      throw new Error(`Server responded with status ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
  }
}

// PopupData.js
export async function fetchPopupData() {
  try {
    let response,
      networkError = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + "/api/popupData", {
          method: "GET",
          headers: await getAuthHeaders(),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (response.status >= 500) {
          networkError = true;
          throw new Error(
            "Server is currently unreachable. Please check your connection or try again later.",
          );
        }
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
      } catch (error) {
        if (attempt === maxAttempts || !networkError)
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
  poolAddress,
  solAmount,
  slippage = slippagePercentage,
  fee = feeAmount,
) {
  try {
    const payload = {
      poolAddress,
      solAmount,
      slippage,
      fee,
    };
    let response,
      networkError = false;
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
        clearTimeout(timeout);
        if (response.status >= 500) {
          networkError = true;
          throw new Error(
            "Server is currently unreachable. Please check your connection or try again later.",
          );
        }
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
      } catch (error) {
        if (attempt === maxAttempts || !networkError)
          throw new Error("Buy failed with error: " + error.message);
      }
    }

    const result = await response.json();
    if (!result?.success)
      throw new Error(result.error || "Unknown error occured.");

    setPnlData(poolAddress, result.pnlData);
    watchPool(poolAddress);

    return {
      success: result.success,
      tokensReceived: result.tokensReceived,
      solSpent: result.solSpent,
      effectivePrice: result.effectivePrice,
      tokenData: result.tokenData,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errMsg = getDebugMode() ? "[API.js] " + message : message;
    return { error: errMsg };
  }
}

// SellHandler.js
async function sellToken(
  poolAddress,
  tokenAmount,
  slippage = slippagePercentage,
  fee = feeAmount,
) {
  const payload = {
    poolAddress,
    tokenAmount,
    slippage,
    fee,
  };
  let response,
    networkError = false;
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
      clearTimeout(timeout);
      if (response.status >= 500) {
        networkError = true;
        throw new Error(
          "Server is currently unreachable. Please check your connection or try again later.",
        );
      }
      if (!response?.ok)
        throw new Error("Server responded with status " + response.status);
    } catch (error) {
      if (attempt === maxAttempts || !networkError)
        throw new Error("Sell failed with error: " + error);
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

// PortfolioHandler.js
export async function getPortfolio() {
  try {
    let response,
      networkError = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + `/api/portfolio`, {
          method: "GET",
          headers: await getAuthHeaders(),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (response.status >= 500) {
          networkError = true;
          throw new Error(
            "Server is currently unreachable. Please check your connection or try again later.",
          );
        }
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
      } catch (error) {
        if (attempt === maxAttempts || !networkError)
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
    let response,
      networkError = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + `/api/reset`, {
          method: "PATCH",
          headers: await getAuthHeaders(),
          body: JSON.stringify({ amount }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (response.status >= 500) {
          networkError = true;
          throw new Error(
            "Server is currently unreachable. Please check your connection or try again later.",
          );
        }
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
      } catch (error) {
        if (attempt === maxAttempts || !networkError)
          throw new Error("Failed to reset account: " + error.message);
      }
    }
    if (!response.resetsLeft)
      throw new Error("resetsLeft not received from server");
    clearPositions();
    if (document.querySelector("#TrenchersPaperTrading") !== null) {
      const { updateBalanceUI } = await import("./dashboard.js");
      updateBalanceUI(true);
    }
    return { success: true, resetsRemaining: response.resetsLeft };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? `[API.js] ${message}` : message, "error");
    throw error;
  }
}

// LogoutHandler.js
export async function logout() {
  try {
    let response,
      networkError = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + `/api/logout`, {
          method: "DELETE",
          headers: await getAuthHeaders(),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (response.status >= 500) {
          networkError = true;
          throw new Error(
            "Server is currently unreachable. Please check your connection or try again later.",
          );
        }
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
      } catch (error) {
        if (attempt === maxAttempts || !networkError)
          throw new Error("Logout failed with error: " + error.message);
      }
    }
    removeFromStorage("sessionToken");
    removeFromStorage("username");
    disableUI();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
    throw error;
  }
}

// LoginHandler.js
export async function login(username, password) {
  try {
    let response,
      networkError = false;
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
        clearTimeout(timeout);
        if (response.status >= 500) {
          networkError = true;
          throw new Error(
            "Server is currently unreachable. Please check your connection or try again later.",
          );
        }
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
      } catch (error) {
        if (attempt === maxAttempts || !networkError)
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
    throw error;
  }
}

// RegisterHandler.js
export async function register(username, password, initialBalance) {
  try {
    let balance = initialBalance;
    let response,
      networkError = false;
    if (!username || !password)
      throw new Error("Username and password are required.");
    if (password.length < 6)
      throw new Error("Password must be at least 6 characters.");
    if (typeof balance != "number") balance = Number(balance);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch("http://localhost:3000/api/create-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, balance }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (response.status >= 500) {
          networkError = true;
          throw new Error(
            "Server is currently unreachable. Please check your connection or try again later.",
          );
        }
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);
      } catch (error) {
        if (attempt === maxAttempts || !networkError)
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
    throw error;
  }
}

// BACKEND FUNCTIONS
export async function sellByPercentage(poolAddress, percentage) {
  try {
    const portfolio = await getPortfolio();
    if (!portfolio?.tokens)
      throw new Error(portfolio.error || "No tokens found in portfolio.");

    const totalAmount = portfolio.tokens[poolAddress].amount;
    if (!totalAmount) throw new Error("No tokens found for this pool.");

    const amountToSell = parseFloat(totalAmount * (percentage / 100));
    if (amountToSell <= 0) throw new Error("No tokens to sell.");

    const result = await sellToken(poolAddress, amountToSell);
    if (percentage === 100) unwatchPool(poolAddress);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errMsg = getDebugMode() ? "[API.js] " + message : message;
    return { error: errMsg };
  }
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
