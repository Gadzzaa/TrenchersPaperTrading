import {
  showNotification,
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

let lastHealthCheckTime = Date.now();
let healthCheckInterval = 15;
let lastHealthCheckStatus = false;

export async function healthCheck() {
  if (Date.now() - lastHealthCheckTime < healthCheckInterval)
    return lastHealthCheckStatus;
  try {
    const response = await fetch(API_BASE_URL + "/health", {
      method: "GET",
    });
    lastHealthCheckStatus = response.ok;
    return lastHealthCheckStatus;
  } catch (error) {
    console.log("Health check failed for backend:", error);
    return false;
  }
}

// SessionChecker.js
export async function checkSession() {
  try {
    const response = await fetch(API_BASE_URL + "/api/check-session", {
      method: "GET",
      headers: await getAuthHeaders(),
    });
    const result = await response.json();
    if (response.status === 401 || !response?.ok)
      throw new Error(
        "Unauthorized: " + result.error || "Please log in again.",
      );
    return true;
  } catch (error) {
    if (isNetworkError(error)) {
      console.warn("⚠️ Network offline or server is unreachable:", error);
      await disableUI("no-internet");
    }
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
    switch (response.status) {
      case 401:
        throw new Error("Unauthorized. Please log in again.");
      case 404:
        throw new Error("Trade log not found.");
      case 429:
        throw new Error("Too many requests. Please try again later.");
      case 500:
      case 501:
      case 502:
        throw new Error(
          "Server is currently unreachable. Please check your connection or try again later.",
        );
    }
    if (!response?.ok)
      throw new Error(`Could not fetch trade log: ${response.status}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("Error fetching trade log:", error);
  }
}

// PopupData.js
export async function fetchPopupData() {
  try {
    let response,
      networkError = false,
      result;
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
        result = await response.json();

        switch (response.status) {
          case 401:
            throw new Error("Unauthorized. Please log in again.");
          case 404:
            throw new Error("Popup Data not found.");
          case 429:
            throw new Error("Too many requests. Please try again later.");
          case 500:
            networkError = true;
            throw new Error(
              "Server is currently unreachable. Please check your connection or try again later.",
            );
        }
        if (response?.ok) break;
        throw new Error(
          `Unknown error occured: ${result.error || response.statusText}`,
        );
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn("⚠️ Network offline or server is unreachable:", error);
          await disableUI("no-internet");
          networkError = true;
        }
        if (attempt === maxAttempts || !networkError)
          throw new Error("Failed to fetch popup data: " + error.message);
      }
    }
    if (!result) throw new Error("No data received from server");
    return result;
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
      networkError = false,
      result;
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
        result = await response.json();

        switch (response.status) {
          case 400:
            throw new Error("Bad request: " + result.error);
          case 401:
            throw new Error("Unauthorized.");
          case 403:
            throw new Error("Forbidden: " + result.error);
          case 500:
            networkError = true;
            throw new Error(
              "Server is currently unreachable. Please check your connection or try again later.",
            );
        }

        if (response?.ok) break;
        throw new Error(
          `Unknown error occured: ${result.error || response.statusText}`,
        );
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn("⚠️ Network offline or server is unreachable:", error);
          await disableUI("no-internet");
          networkError = true;
        }
        if (attempt === maxAttempts || !networkError)
          throw new Error("Buy failed with error: " + error.message);
      }
    }

    if (!result?.success)
      throw new Error(result.error || "Unknown error occured.");

    setPnlData(poolAddress, result.pnlData);

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
    networkError = false,
    result;
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
      result = await response.json();

      switch (response.status) {
        case 400:
          throw new Error("Bad request: " + result.error);
        case 401:
          throw new Error("Unauthorized.");
        case 500:
          networkError = true;
          throw new Error(
            "Server is currently unreachable. Please check your connection or try again later.",
          );
      }
      if (response?.ok) break;
      throw new Error(
        `Unknown error occured: ${result.error || response.statusText}`,
      );
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn("⚠️ Network offline or server is unreachable:", error);
        await disableUI("no-internet");
        networkError = true;
      }
      if (attempt === maxAttempts || !networkError)
        throw new Error("Sell failed with error: " + error);
    }
  }

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
      networkError = false,
      result;
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
        result = await response.json();

        switch (response.status) {
          case 401:
            throw new Error("Unauthorized. Please log in again.");
          case 404:
            throw new Error("Portfolio not found.");
          case 500:
            networkError = true;
            throw new Error(
              "Server is currently unreachable. Please check your connection or try again later.",
            );
        }
        if (response?.ok) break;
        throw new Error(
          `Unknown error occured: ${result.error || response.statusText}`,
        );
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn("⚠️ Network offline or server is unreachable:", error);
          await disableUI("no-internet");
          networkError = true;
        }
        if (attempt === maxAttempts || !networkError)
          throw new Error("Failed to fetch portfolio: " + error.message);
      }
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: getDebugMode() ? "[API.js] " + message : message };
  }
}

// ResetHandler.js
export async function resetAccount(amount) {
  try {
    let response,
      networkError = false,
      result;
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
        result = await response.json();

        switch (response.status) {
          case 400:
            throw new Error("Bad request: " + result.error);
          case 401:
            throw new Error("Unauthorized. Please log in again.");
          case 403:
            throw new Error("Forbidden: " + result.error);
          case 404:
            throw new Error("Not found: ", result.error);
          case 409:
            throw new Error("Error occured: " + result.error);
          case 500:
            networkError = true;
            throw new Error(
              "Server is currently unreachable. Please check your connection or try again later.",
            );
        }
        if (response?.ok) break;
        throw new Error(
          `Unknown error occured: ${result.error || response.statusText}`,
        );
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn("⚠️ Network offline or server is unreachable:", error);
          await disableUI("no-internet");
          chrome.runtime.sendMessage({ type: "no-internet" });
          networkError = true;
        }
        if (attempt === maxAttempts || !networkError)
          throw new Error("Failed to reset account: " + error.message);
      }
    }
    if (!result.resetsLeft)
      throw new Error("resetsLeft not received from server");
    clearPositions();
    if (document.querySelector("#TrenchersPaperTrading") !== null) {
      const { updateBalanceUI } = await import("./dashboard.js");
      updateBalanceUI(true);
    }
    return { success: true, resetsRemaining: result.resetsLeft };
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
      networkError = false,
      result;
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
        result = await response.json();

        switch (response.status) {
          case 400:
            throw new Error("Bad request: " + result.error);
          case 401:
            throw new Error("Unauthorized. Please log in again.");
          case 500:
            networkError = true;
            throw new Error(
              "Server is currently unreachable. Please check your connection or try again later.",
            );
        }
        if (response?.ok) break;
        throw new Error(
          `Unknown error occured: ${result.error || response.statusText}`,
        );
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn("⚠️ Network offline or server is unreachable:", error);
          await disableUI("no-internet");
          networkError = true;
        }
        if (attempt === maxAttempts || !networkError)
          throw new Error("Logout failed with error: " + error.message);
      }
    }
    removeFromStorage("sessionToken");
    removeFromStorage("username");
    chrome.runtime.sendMessage({ type: "logoutDashboard" });
    await disableUI("no-session");
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
      networkError = false,
      result;
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
        result = await response.json();

        switch (response.status) {
          case 401:
            throw new Error("Invalid credentials.");
          case 500:
            networkError = true;
            throw new Error(
              "Server is currently unreachable. Please check your connection or try again later.",
            );
        }
        if (response?.ok) break;
        throw new Error(
          `Unknown error occured: ${result.error || response.statusText}`,
        );
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn("⚠️ Network offline or server is unreachable:", error);
          await disableUI("no-internet");
          networkError = true;
        }
        if (attempt === maxAttempts || !networkError)
          throw new Error("Login failed with error: " + error.message);
      }
    }
    if (!result?.token)
      throw new Error("No token received from server: " + result.error);
    if (!result?.username)
      throw new Error("No username received from server: " + result.error);

    await setToStorage("sessionToken", result.token);
    await setToStorage("username", result.username);
    chrome.runtime.sendMessage({ type: "initDashboard" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
    throw error;
  }
}

// RegisterHandler.js
export async function register(username, password, initialBalance) {
  try {
    let balance = initialBalance,
      response,
      networkError = false,
      result;
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
        result = await response.json();
        switch (response.status) {
          case 400:
            throw new Error("Bad request: " + result.error);
          case 409:
            throw new Error("Username already exists.");
          case 500:
            networkError = true;
            throw new Error(
              "Server is currently unreachable. Please check your connection or try again later.",
            );
        }
        if (response?.ok) break;
        throw new Error(
          `Unknown error occured: ${result.error || response.statusText}`,
        );
      } catch (error) {
        if (isNetworkError(error)) {
          console.warn("⚠️ Network offline or server is unreachable:", error);
          await disableUI("no-internet");
          networkError = true;
        }
        if (attempt === maxAttempts || !networkError)
          throw new Error("Registration failed with error: " + error.message);
      }
    }
    if (!result?.token)
      throw new Error("No token received from server: " + result.error);
    if (!result?.username)
      throw new Error("No username received from server: " + result.error);

    await setToStorage("username", result.username);
    await setToStorage("sessionToken", result.token);
    chrome.runtime.sendMessage({ type: "initDashboard" });
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

function isNetworkError(error) {
  return (
    error.name === "TypeError" &&
    (error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("ERR_CONNECTION_REFUSED") ||
      error.message.includes("ERR_INTERNET_DISCONNECTED") ||
      error.message.includes("The network connection was lost"))
  );
}
