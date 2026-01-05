import {
  showNotification,
  disableUI,
  getFromStorage,
  setToStorage,
  removeFromStorage,
  rateLimit,
} from "./utils.js";
import { getDebugMode } from "../config.js";
import CONFIG, { USE_LOCAL } from "../config.js";
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

let lastHealthCheckTime;
let healthCheckInterval = 15;
let lastHealthCheckStatus = false;

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  buy: { maxCalls: 2, windowMs: 1000 }, // 5 buys per 10 seconds
  sell: { maxCalls: 2, windowMs: 1000 }, // 5 sells per 10 seconds
  reset: { maxCalls: 2, windowMs: 60000 }, // 2 resets per minute
};

export async function healthCheck() {
  if (Date.now() - lastHealthCheckTime < healthCheckInterval)
    return lastHealthCheckStatus;

  try {
    const response = await fetch(API_BASE_URL + "/health", {
      method: "GET",
    });
    lastHealthCheckStatus = response.ok;
    lastHealthCheckTime = Date.now();
    return lastHealthCheckStatus;
  } catch (error) {
    console.log("Health check failed for backend:", error);
    return false;
  }
}

// SessionChecker.js
export async function checkSession() {
  try {
    const response = await fetch(API_BASE_URL + "/check-session", {
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

export async function isLatestVersion() {
  if (USE_LOCAL) return true;
  try {
    const manifest = chrome.runtime.getManifest();
    const version = manifest.version;

    const response = await fetch(`${API_BASE_URL}/latest?version=${version}`, {
      method: "GET",
    });

    const result = await response.json();
    if (response.status === 401 || !response?.ok)
      throw new Error("Invalid version: " + result.error);

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

export async function upgradeSubscription(type) {
  try {
    let lookup_key = "";
    if (type == "monthly") lookup_key = "pro_monthly";
    else lookup_key = "pro_yearly";

    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        lookup_key: lookup_key,
      }),
    });
    switch (response.status) {
      case 401:
        throw new Error("Unauthorized. Please log in again.");
      case 404:
        throw new Error("Not found.");
      case 429:
        throw new Error("Too many requests. Please try again later.");
      case 500:
      case 501:
      case 502:
        throw new Error(
          "Server is currently unreachable. Please check your connection or try again later.",
        );
    }

    const { url } = await response.json();
    chrome.tabs.create({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
  }
}

export async function manageSubscription() {
  try {
    const response = await fetch(`${API_BASE_URL}/create-portal-session`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    switch (response.status) {
      case 401:
        throw new Error("Unauthorized. Please log in again.");
      case 404:
        throw new Error("Not found.");
      case 429:
        throw new Error("Too many requests. Please try again later.");
      case 500:
      case 501:
      case 502:
        throw new Error(
          "Server is currently unreachable. Please check your connection or try again later.",
        );
    }

    const { url } = await response.json();
    chrome.tabs.create({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
  }
}

// PNLHandler.js
export async function getTradeLog() {
  try {
    const response = await fetch(API_BASE_URL + "/tradeLog", {
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
        response = await fetch(API_BASE_URL + "/popupData", {
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
    // Rate limiting check
    if (
      !rateLimit(
        "buy",
        RATE_LIMIT_CONFIG.buy.maxCalls,
        RATE_LIMIT_CONFIG.buy.windowMs,
      )
    ) {
      throw new Error(
        "Too many buy requests. Please wait a moment and try again.",
      );
    }

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
        response = await fetch(API_BASE_URL + "/buy", {
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
  // Rate limiting check
  if (
    !rateLimit(
      "sell",
      RATE_LIMIT_CONFIG.sell.maxCalls,
      RATE_LIMIT_CONFIG.sell.windowMs,
    )
  ) {
    throw new Error(
      "Too many sell requests. Please wait a moment and try again.",
    );
  }

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
      response = await fetch(API_BASE_URL + "/sell", {
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
        response = await fetch(API_BASE_URL + `/portfolio`, {
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
    // Rate limiting check
    if (
      !rateLimit(
        "reset",
        RATE_LIMIT_CONFIG.reset.maxCalls,
        RATE_LIMIT_CONFIG.reset.windowMs,
      )
    ) {
      throw new Error(
        "Too many reset requests. Please wait a moment and try again.",
      );
    }

    let response,
      networkError = false,
      result;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + `/reset`, {
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
        response = await fetch(API_BASE_URL + `/logout`, {
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
        response = await fetch(API_BASE_URL + "/login", {
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
    if (username.length < 3)
      throw new Error("Username must be at least 3 characters.");
    if (username.length > 20)
      throw new Error("Username must be at most 20 characters.");
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      throw new Error(
        "Username can only contain letters, numbers, and underscores.",
      );
    if (password.length < 8)
      throw new Error("Password must be at least 8 characters.");
    if (password.length > 128)
      throw new Error("Password must be at most 128 characters.");
    if (!/[A-Z]/.test(password))
      throw new Error("Password must contain at least one uppercase letter.");
    if (!/[a-z]/.test(password))
      throw new Error("Password must contain at least one lowercase letter.");
    if (!/[0-9]/.test(password))
      throw new Error("Password must contain at least one number.");
    if (typeof balance != "number") balance = Number(balance);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + "/create-account", {
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

export async function saveSettings(settings) {
  try {
    let response,
      result,
      networkError = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + "/save-settings", {
          method: "POST",
          headers: await getAuthHeaders(),
          body: JSON.stringify(settings),
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
          throw new Error("Could not save settings: " + error.message);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
    throw error;
  }
}

export async function getSettings() {
  try {
    let response,
      result,
      networkError = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        response = await fetch(API_BASE_URL + "/get-settings", {
          method: "GET",
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
          throw new Error("Could not get settings: " + error.message);
      }
    }
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(getDebugMode() ? "[API.js] " + message : message, "error");
    throw error;
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
