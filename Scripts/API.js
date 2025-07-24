import { showNotification, showSpinner, hideSpinner } from "./utils.js";
import { updateBalanceUI } from "./dashboard.js";
import CONFIG, { USE_LOCAL } from "../config.js";
const API_BASE_URL = CONFIG.API_BASE_URL;
const maxAttempts = 3;

// SessionChecker.js
export async function checkSession() {
  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(API_BASE_URL + "/api/check-session", {
          method: "GET",
          headers: getAuthHeaders(),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);

        const data = await response.json();
        if (!data) throw new Error("No data received from server");

        return data.valid === true;
      } catch (error) {
        if (attempt === maxAttempts)
          throw new Error("Failed to check session: " + error);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(USE_LOCAL ? "[API.js] " + message : message, "error");
  }
  return false;
}

// BuyHandler.js
export async function buyToken(
  tokenMint,
  solAmount,
  tokenPrice,
  slippage = 2,
  fee = 0.1,
) {
  try {
    const payload = {
      tokenMint,
      solAmount,
      tokenPrice,
      slippage,
      fee,
    };
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(API_BASE_URL + "/api/buy", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);

        clearTimeout(timeout);

        const result = await response.json();
        if (!result?.success)
          throw new Error(result.error || "Unknown error occured.");
        if (result?.tokensReceived <= 0)
          throw new Error("Received 0 tokens, check your balance or price.");

        return {
          success: true,
          tokensReceived: result.tokensReceived,
          solSpent: result.solSpent,
          fees: result.fees,
        };
      } catch (error) {
        if (attempt === maxAttempts)
          throw new Error("Buy failed with error: " + error.message);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errMsg = USE_LOCAL ? "[API.js] " + message : message;
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
    const errMsg = USE_LOCAL ? "[API.js] " + message : message;
    return { error: errMsg };
  }
}

// PortfolioHandler.js
export async function getPortfolio() {
  try {
    const username = localStorage.getItem("username");
    if (!username) throw new Error("No loggedInUsername found in localStorage");
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(
          API_BASE_URL + `/api/portfolio/${encodeURIComponent(username)}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
            signal: controller.signal,
          },
        );
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);

        clearTimeout(timeout);

        const data = await response.json();
        if (!data) throw new Error("No data received from server");

        return data;
      } catch (error) {
        if (attempt === maxAttempts)
          throw new Error("Failed to fetch portfolio: " + error.message);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: USE_LOCAL ? "[API.js] " + message : message };
  }
  return null;
}

// ResetHandler.js
export async function resetAccount(amount) {
  try {
    const username = localStorage.getItem("username");
    if (!username)
      throw new Error("No logged in username found in localStorage");

    if (isNaN(amount) || amount < 1)
      throw new Error("Invalid amount — must be a number ≥ 1");

    await resetUserData(username);
    await setUserBalance(amount);

    clearPositions();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(USE_LOCAL ? `[API.js] ${message}` : message, "error");
  }
}

// LoginHandler.js
export async function login(username, password) {
  try {
    if (!username || !password)
      throw new Error("Username and password are required.");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(API_BASE_URL + "/api/login", {
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

        const result = await response.json();
        if (!result?.token)
          throw new Error("No token received from server: " + result.error);

        localStorage.setItem("username", username);
        localStorage.setItem("sessionToken", result.token);
        // TODO: enable dashboard access
        break;
      } catch (error) {
        if (attempt === 1)
          throw new Error("Login failed with error: " + error.message);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(USE_LOCAL ? "[API.js] " + message : message, "error");
  }
}

// RegisterHandler.js
export async function register(username, password) {
  try {
    if (!username || !password)
      throw new Error("Username and password are required.");
    if (password.length < 6)
      throw new Error("Password must be at least 6 characters.");

    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(
          "http://localhost:3000/api/create-account",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
            signal: controller.signal,
          },
        );
        if (!response?.ok)
          throw new Error(`Server responded with status ${response.status}`);

        const result = await response.json();
        if (!result?.token)
          throw new Error("No token received from server: " + result.error);

        localStorage.setItem("username", username);
        localStorage.setItem("sessionToken", result.token);
        resetAccount(100);
        // TODO: enable dashboard access
        break;
      } catch (error) {
        if (attempt === 1)
          throw new Error("Registration failed with error: " + error.message);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(USE_LOCAL ? "[API.js] " + message : message, "error");
  }
}

// BACKEND FUNCTIONS
async function sellToken(
  tokenMint,
  tokenAmount,
  tokenPrice,
  slippage = 2,
  fee = 0.1,
) {
  const payload = {
    tokenMint,
    tokenAmount,
    tokenPrice,
    slippage,
    fee,
  };
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(API_BASE_URL + "/api/sell", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response?.ok) {
        return {
          error: "Server responded with status " + response.status,
        };
      }
      clearTimeout(timeout);

      const result = await response.json();
      if (!result?.success) {
        return {
          error: result.error || "Unknown error occured.",
        };
      }

      return {
        success: true,
        solReceived: result.solReceived,
        tokensSold: result.tokensSold,
        fees: result.fees,
      };
    } catch (error) {
      if (attempt === maxAttempts) return { error: error.message }; // Simplified since it will pass through sellByPercentage
    }
  }
}

async function resetUserData(username) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(
        `http://localhost:3000/api/reset/:${username}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          signal: controller.signal,
        },
      );
      if (!response?.ok)
        throw new Error(`Server responded with status ${response.status}`);

      clearTimeout(timeout);

      const data = await response.json();
      if (!data) throw new Error("No data received from server");
    } catch (error) {
      if (attempt === maxAttempts)
        throw new Error("Failed to reset user data: " + error.message);
    }
  }
}

async function setUserBalance(amount) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("http://localhost:3000/api/set-balance", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount }),
        signal: controller.signal,
      });
      if (!response?.ok)
        throw new Error(`Server responded with status ${response.status}`);

      clearTimeout(timeout);

      const data = await response.json();
      if (!data) throw new Error("No data received from server");
    } catch (error) {
      if (attempt === maxAttempts)
        throw new Error(
          "Failed to set user balance: " +
            error.message +
            "\n Please try again.",
        );
    }
  }
}

function getAuthHeaders() {
  const sessionToken = localStorage.getItem("sessionToken");
  if (!sessionToken) {
    throw new Error("No sessionToken found. Please log in again.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionToken}`,
  };
}
