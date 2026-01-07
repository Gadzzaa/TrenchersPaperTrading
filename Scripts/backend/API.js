import {
  disableUI,
  setToStorage,
  removeFromStorage,
  handleError,
} from "../utils.js";
import { clearPositions, setPnlData, unwatchPool } from "../pnlHandler.js";
import { BackendRequest } from "./BackendRequest.js";
import { BackendHelpers } from "./BackendHelpers.js";

//TODO: Fix backend API
const slippagePercentage = 0;
const feeAmount = 0;

let lastHealthCheckTime;
let healthCheckInterval = 15;
let lastHealthCheckStatus = false;

export async function healthCheck() {
  if (Date.now() - lastHealthCheckTime < healthCheckInterval)
    return lastHealthCheckStatus;

  try {
    const response = await new BackendRequest()
      .addEndpoint("/health")
      .addMethod("GET")
      .build();
    lastHealthCheckStatus = response.status == "ok" ? true : false;
    lastHealthCheckTime = Date.now();
    return lastHealthCheckStatus;
  } catch (error) {
    handleError(error, "Health check failed: ", { show: false });
    return false;
  }
}

// SessionChecker.js
export async function checkSession() {
  try {
    const response = await new BackendRequest()
      .addEndpoint("/check-session")
      .addMethod("GET")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .addRetries(2)
      .build();
    return true;
  } catch (error) {
    handleError(error, "Could not validate session: ", { sound: false });
    return false;
  }
}

export async function isLatestVersion() {
  const manifest = chrome.runtime.getManifest();
  const version = manifest.version;
  try {
    const response = await new BackendRequest()
      .addEndpoint("/latest?version=" + version)
      .addMethod("GET")
      .addRetries(2)
      .build();
    return response.ok;
  } catch (error) {
    handleError(error, "Could not check latest version: ");
    return false;
  }
}

export async function upgradeSubscription(type) {
  let lookup_key = "";
  if (type == "monthly") lookup_key = "pro_monthly";
  else lookup_key = "pro_yearly";

  try {
    const response = await new BackendRequest()
      .addEndpoint("/create-checkout-session")
      .addMethod("POST")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .addBody(JSON.stringify({ lookup_key }))
      .build();

    const url = response.url;
    chrome.tabs.create({ url });
  } catch (error) {
    handleError(error, "Could not upgrade subscription: ");
  }
}

export async function manageSubscription() {
  try {
    const response = await new BackendRequest()
      .addEndpoint("/create-portal-session")
      .addMethod("POST")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .build();

    const { url } = response.url;
    chrome.tabs.create({ url });
  } catch (error) {
    handleError(error, "Could not manage subscription: ");
  }
}

// PNLHandler.js
export async function getTradeLog() {
  try {
    const response = await new BackendRequest()
      .addEndpoint("/tradeLog")
      .addMethod("GET")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .build();
    return response;
  } catch (error) {
    handleError(error, "Could not fetch trade log: ", { sound: false });
  }
}

// PopupData.js
export async function fetchPopupData() {
  try {
    const response = await new BackendRequest()
      .addEndpoint("/popupData")
      .addMethod("GET")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .addRetries(2)
      .build();

    if (!response) throw new Error("No data received from server");
    return response;
  } catch (error) {
    handleError(error, "Could not fetch popup data: ");
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
    const response = await new BackendRequest()
      .addEndpoint("/buy")
      .addMethod("POST")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .addBody(JSON.stringify(payload))
      .addRetries(2)
      .build();

    if (!response?.success)
      throw new Error(response.error || "Unknown error occured.");

    setPnlData(poolAddress, response.pnlData);

    return {
      success: response.success,
      tokensReceived: response.tokensReceived,
      solSpent: response.solSpent,
      effectivePrice: response.effectivePrice,
      tokenData: response.tokenData,
    };
  } catch (error) {
    handleError(error, "Buy token failed: ");
    return { error };
  }
}

// SellHandler.js
export async function sellToken(
  poolAddress,
  percentage,
  slippage = slippagePercentage,
  fee = feeAmount,
) {
  try {
    const tokenAmount = BackendHelpers.calculatePricePercentage(
      poolAddress,
      percentage,
      await getPortfolio(),
    );
    const payload = {
      poolAddress,
      tokenAmount,
      slippage,
      fee,
    };

    const response = await new BackendRequest()
      .addEndpoint("/sell")
      .addMethod("POST")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .addBody(JSON.stringify(payload))
      .addRetries(2)
      .build();

    if (!response?.success)
      throw new Error(response.error || "Unknown error occured.");

    if (percentage === 100) unwatchPool(poolAddress);

    return {
      success: response.success,
      solReceived: response.solReceived,
      tokensSold: response.tokensSold,
      effectivePrice: response.effectivePrice,
    };
  } catch (error) {
    handleError(error, "Sell token failed: ");
    return { error };
  }
}

// PortfolioHandler.js
export async function getPortfolio() {
  try {
    const response = await new BackendRequest()
      .addEndpoint("/portfolio")
      .addMethod("GET")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .build();

    return response;
  } catch (error) {
    handleError(error, "Could not fetch portfolio: ");
    return { error };
  }
}

// ResetHandler.js
export async function resetAccount(amount) {
  try {
    const response = await new BackendRequest()
      .addEndpoint("/reset")
      .addMethod("PATCH")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .addBody(JSON.stringify({ amount }))
      .addRetries(2)
      .build();

    if (!response.resetsLeft)
      throw new Error("resetsLeft not received from server");

    clearPositions();

    if (document.querySelector("#TrenchersPaperTrading") !== null) {
      const { updateBalanceUI } = await import("../dashboard.js");
      updateBalanceUI(true);
    }

    return { success: true, resetsRemaining: response.resetsLeft };
  } catch (error) {
    handleError(error, "Could not reset account: ");
    throw error;
  }
}

// LogoutHandler.js
export async function logout() {
  try {
    const response = await new BackendRequest()
      .addEndpoint("/logout")
      .addMethod("DELETE")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .addRetries(2)
      .build();

    removeFromStorage("sessionToken");
    removeFromStorage("username");
    chrome.runtime.sendMessage({ type: "logoutDashboard" });
    await disableUI("no-session");
  } catch (error) {
    handleError(error, "Could not log out: ");
    throw error;
  }
}

// LoginHandler.js
export async function login(username, password) {
  try {
    if (!username || !password)
      throw new Error("Username and password are required.");

    const response = await new BackendRequest()
      .addEndpoint("/login")
      .addMethod("POST")
      .addBody(JSON.stringify({ username, password }))
      .build();

    if (!response?.token)
      throw new Error("No token received from server: " + response.error);
    if (!response?.username)
      throw new Error("No username received from server: " + response.error);

    await setToStorage("sessionToken", response.token);
    await setToStorage("username", response.username);
    chrome.runtime.sendMessage({ type: "initDashboard" });
  } catch (error) {
    handleError(error, "Login failed: ");
    throw error;
  }
}

// RegisterHandler.js
export async function register(username, password, balance) {
  try {
    BackendHelpers.registerValidator(username, password, balance);

    const response = await new BackendRequest()
      .addEndpoint("/create-account")
      .addMethod("POST")
      .addBody(JSON.Stringify({ username, password, balance }))
      .addRetries(2)
      .build();

    if (!response?.token)
      throw new Error("No token received from server: " + response.error);
    if (!response?.username)
      throw new Error("No username received from server: " + response.error);

    await setToStorage("username", response.username);
    await setToStorage("sessionToken", response.token);
    chrome.runtime.sendMessage({ type: "initDashboard" });
  } catch (error) {
    handleError(error, "Registration failed: ");
    throw error;
  }
}

export async function saveSettings(settings) {
  try {
    const response = await new BackendRequest()
      .addEndpoint("/save-settings")
      .addMethod("POST")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .addBody(JSON.stringify(settings))
      .addRetries(2)
      .build();
  } catch (error) {
    handleError(error, "Could not save settings: ");
    throw error;
  }
}

export async function getSettings() {
  try {
    const response = await new BackendRequest()
      .addEndpoint("/get-settings")
      .addMethod("GET")
      .addHeaders(await BackendHelpers.getAuthHeaders())
      .build();

    return response;
  } catch (error) {
    handleError(error, "Could not get settings: ");
    throw error;
  }
}
