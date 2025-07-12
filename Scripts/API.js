import { showNotification, showSpinner, hideSpinner } from "./utils.js";
import { updateBalanceUI } from "./dashboard.js";
import CONFIG from "../config.js";
const API_BASE_URL = CONFIG.API_BASE_URL;

// SessionChecker.js
export async function checkSession() {
  const sessionToken = localStorage.getItem("sessionToken");
  if (!sessionToken) {
    console.warn("⚠️ No session token found.");
    return false;
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(API_BASE_URL + "/api/check-session", {
        method: "GET",
        headers: getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        console.error(
          "❌ Server responded with error status:",
          response.status,
        );
        return false;
      }

      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      if (attempt === 1) {
        console.error("❌ Failed to check session after retry:", error);
        return false;
      }
    }
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
  const payload = {
    tokenMint,
    solAmount,
    tokenPrice,
    slippage,
    fee,
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(API_BASE_URL + "/api/buy", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          tokensReceived: result.tokensReceived,
          solSpent: result.solSpent,
          fees: result.fees,
        };
      } else throw new Error(result.error || "Buy failed");
    } catch (error) {
      if (attempt === 1) {
        console.error("❌ Buy failed after retry:", error);
        return null;
      }
    }
  }
}

// SellHandler.js
export async function sellByPercentage(tokenMint, percentage, price) {
  try {
    const portfolio = await getPortfolio();
    if (!portfolio || !portfolio.tokens) {
      throw new Error("Portfolio data invalid.");
    }

    const totalAmount = portfolio.tokens[tokenMint];
    if (!totalAmount) {
      showNotification("❌ No tokens found for this mint.", "error");
      return;
    }

    const amountToSell = parseFloat(
      (totalAmount * (percentage / 100)).toFixed(9),
    );

    if (amountToSell <= 0) {
      showNotification("❌ No tokens to sell.", "error");
      return;
    }

    const result = await sellToken(tokenMint, amountToSell, price);

    if (result) {
      showNotification(
        `✅ Sold ${result.tokensSold.toFixed(2)} tokens for ${result.solReceived.toFixed(2)} SOL!`,
        "success",
      );
      return result;
    } else showNotification("❌ Sell failed.", "error");
  } catch (error) {
    console.error("❌ Error during sell by percentage:", error.message);
    showNotification("❌ Server error during selling.", "error");
  }
}

async function sellToken(
  tokenMint,
  tokenAmount,
  tokenPrice,
  slippage = 2,
  fee = 0.1,
) {
  const sessionToken = localStorage.getItem("sessionToken");
  if (!sessionToken) {
    throw new Error("No sessionToken found. Please log in again.");
  }

  const payload = {
    tokenMint,
    tokenAmount,
    tokenPrice,
    slippage,
    fee,
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(API_BASE_URL + "/api/sell", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          solReceived: result.solReceived,
          tokensSold: result.tokensSold,
          fees: result.fees,
        };
      } else throw new Error(result.error || "Sell operation failed");
    } catch (error) {
      if (attempt === 1) {
        console.error("❌ Failed to sell token after retry:", error);
        showNotification(
          "❌ Failed to sell token after retry. Please try again later.",
          "error",
        );
        return;
      }
      showNotification(`❌ Sell failed. Retrying... ${error.message}`, "error");
    }
  }
}

// PortfolioHandler.js
export async function getPortfolio() {
  const username = localStorage.getItem("username");
  const sessionToken = localStorage.getItem("sessionToken");
  if (!username) {
    throw new Error("No loggedInUsername found in localStorage");
  }
  if (!sessionToken) {
    throw new Error("No sessionToken found. Please log in again.");
  }
  for (let attempt = 0; attempt < 2; attempt++) {
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
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      if (attempt === 1) {
        console.error("❌ Failed to fetch portfolio after retry:", error);
        return null;
      }
      console.warn("Fetching portfolio failed. Retrying...", error);
    }
  }
  return null;
}

// ResetHandler.js
export async function resetAccount(accountDropdown, input) {
  try {
    const username = localStorage.getItem("username");
    let resp, data;

    // RESET
    resp = await fetch(`http://localhost:3000/api/reset/:${username}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Reset failed");
    // SET BALANCE
    const amount = input;
    if (isNaN(amount) || amount < 1) {
      throw new Error("Invalid amount—must be a number ≥ 1");
    }
    resp = await fetch("http://localhost:3000/api/set-balance", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Set balance failed");
    clearPositions(); // Clear positions
    // Refresh your UI
    await updateBalanceUI();
    if (accountDropdown) {
      accountDropdown.style.animation = "dropdownCollapse 0.3s ease forwards";
      setTimeout(() => {
        accountDropdown.style.opacity = "0";
        accountDropdown.style.pointerEvents = "none";
      }, 300);
    }
  } catch (err) {
    console.error("Manage balance error:", err);
  } finally {
    hideSpinner();
  }
}

// LoginHandler.js
export async function login(username, password) {
  if (!username || !password) {
    showNotification("Please fill in both fields.", "error");
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 600)); // 600ms small delay
  for (let attempt = 0; attempt < 2; attempt++) {
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
      clearTimeout(timeout);

      const result = await response.json();
      if (response.ok) {
        if (!result.token)
          throw new Error("Invalid token received. Please try again.");
        showNotification("Login Successful", "success");
        localStorage.setItem("username", username);
        localStorage.setItem("sessionToken", result.token);
        // TODO: enable dashboard access
        break;
      } else throw new Error(result.error || "Login failed");
    } catch (error) {
      if (attempt === 1) {
        console.error("Login failed after retry:", error);
        showNotification("Login failed after retry: " + error, "error");
        return;
      }
      showNotification("Login failed. Retrying...", "error");
    }
  }
}

// RegisterHandler.js
export async function register(username, password) {
  if (!username || !password) {
    showNotification("Please fill in both fields.", "error");
    return;
  }
  if (password.length < 6) {
    showNotification("Password must be at least 6 characters.", "error");
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 600)); // 600ms small delay
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch("http://localhost:3000/api/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        showNotification("Account created successfully!", "success");
        localStorage.setItem("username", username);
        localStorage.setItem("sessionToken", result.token);
        resetAccount(100); // 🔥 Reset account
        // TODO: enable dashboard access
        break;
      } else throw new Error(result.error || "Registration failed.");
    } catch (error) {
      if (attempt === 1) {
        console.error("❌ Failed to register after retry:", error);
        showNotification(
          "Failed to register after retry. Please try again later.",
          "error",
        );
        return;
      }
      showNotification(
        "Registration failed. Retrying... " + error.message,
        "error",
      );
      console.warn("Registration failed. Retrying...", error);
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
