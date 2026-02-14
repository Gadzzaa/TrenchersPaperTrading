import { showNotification, clearManagedInterval } from "./utils.js";
import { getDebugMode } from "../config.js";
import { getFromStorage } from "./utils.js";
import { DataManager } from "./Account/Core/DataManager.js";
import CONFIG from "../config.js";
const openPositions = [];
let currentPool = null;
let pnlDataArray = [];
const watchedPools = new Map();
let ws;
let isConnected = false;
let pnlIntervalId = null;
let heartbeatInterval;
let lastPong = Date.now();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 500; // milliseconds

export function setPnlData(poolAddress, pnlData) {
  const idx = pnlDataArray.findIndex(
    (p) => p.poolAddress.toString() === poolAddress.toString(),
  );
  if (idx >= 0) {
    console.warn("Pnl data for pool already exists:", poolAddress);
    return;
  }
  pnlDataArray.push({ poolAddress, ...pnlData });
  localStorage.setItem("pnlDataArray", JSON.stringify(pnlDataArray));
}
function getPnlData(poolAddress) {
  const stored = localStorage.getItem("pnlDataArray");
  let arr = [];
  try {
    pnlDataArray = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse pnlDataArray from localStorage", e);
    arr = [];
  }
  const data = pnlDataArray.find(
    (p) => p.poolAddress.toString() === poolAddress.toString(),
  );
  return data || null;
}

export async function connectWebSocket() {
  // If there's already a valid or connecting WebSocket, reuse it
  if (
    ws &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  ) {
    console.log(
      "⚠️ WebSocket already open or connecting, skipping new connection",
    );
    return ws;
  }

  const token = await getFromStorage("sessionToken");
  ws = new WebSocket(CONFIG.WS_URL);

  return new Promise((resolve, reject) => {
    let authTimeout;

    ws.onopen = () => {
      console.log("🔄 WebSocket connecting...");
      ws.send(
        JSON.stringify({
          type: "authenticate",
          token,
        }),
      );

      // Set a timeout for authentication (10s)
      authTimeout = setTimeout(() => {
        reject(new Error("WebSocket authentication timeout"));
        ws.close();
      }, 10000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "authenticated":
            console.log("✅ WebSocket connected and authenticated");

            isConnected = true;
            reconnectAttempts = 0;
            lastPong = Date.now();
            if (heartbeatInterval) clearInterval(heartbeatInterval);

            // Heartbeat every 15s
            heartbeatInterval = setInterval(() => {
              if (!ws || ws.readyState !== WebSocket.OPEN) return;

              const now = Date.now();
              if (now - lastPong > 60 * 1000) {
                console.warn(
                  "⚠️ WebSocket heartbeat timeout, forcing reconnect...",
                );
                ws.close();
                return;
              }

              ws.send(JSON.stringify({ type: "ping" }));
            }, 15000);

            clearTimeout(authTimeout);
            resolve(ws);
            break;

          case "poolUpdate":
            console.log("📊 Pool update:", data);
            const pool = watchedPools.get(data.poolAddress);
            if (pool) {
              pool.price = data.price;
              pool.liquidity = data.liquidity;
            } else {
              ws.send(
                JSON.stringify({
                  type: "unwatchPool",
                  poolAddress: data.poolAddress,
                }),
              );
            }
            break;

          case "pong":
            lastPong = Date.now();
            console.log("🏓 Pong received");
            break;

          default:
            console.warn("Unknown message type:", data.type, data);
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.onclose = async () => {
      console.log("🛑 WebSocket disconnected, reconnecting...");
      ws = null;
      isConnected = false;
      clearInterval(heartbeatInterval);
      clearTimeout(authTimeout);

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        // Exponential backoff: delay = baseDelay * 2^attempts
        const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
        console.log(
          `Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`,
        );

        setTimeout(() => {
          reconnectAttempts++;
          connectWebSocket().catch((err) => {
            console.error("Reconnection failed:", err);
          });
        }, delay);
      } else {
        console.error(
          "Max reconnection attempts reached. Disconnecting dashboard.",
        );
        const { disconnectDashboard } = await import("./dashboard.js");
        disconnectDashboard();
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      clearTimeout(authTimeout);
      reject(err);
    };
  });
}

export function disconnectWebSocket() {
  if (!ws) return;

  console.log("🛑 Disconnecting WebSocket...");

  if (currentPool) unwatchPool(currentPool);
  currentPool = null;

  // Stop heartbeat interval
  if (heartbeatInterval) {
    clearManagedInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  // Stop any PnL interval
  if (pnlIntervalId) {
    clearManagedInterval(pnlIntervalId);
    pnlIntervalId = null;
  }

  // Remove all listeners (optional but safer)
  ws.onopen = null;
  ws.onmessage = null;
  ws.onerror = null;
  ws.onclose = null;

  // Close the WebSocket
  ws.close();

  // Reset state
  ws = null;
  isConnected = false;
  reconnectAttempts = 0;
  return ws;
}

export function watchPool(poolAddress) {
  if (!watchedPools.has(poolAddress)) {
    // add pool to local map with empty data
    watchedPools.set(poolAddress, { price: null, liquidity: null });
  }

  // send watch request to backend
  const data = getPnlData(poolAddress);
  ws.send(JSON.stringify({ type: "watchPool", poolAddress, poolData: data }));
}

export function unwatchPool(poolAddress) {
  if (watchedPools.has(poolAddress)) {
    ws.send(JSON.stringify({ type: "unwatchPool", poolAddress }));
    watchedPools.delete(poolAddress);
  }
}

export function setActiveToken(poolAddress) {
  if (pnlIntervalId) clearManagedInterval(pnlIntervalId);

  currentPool = poolAddress;
  const idx = openPositions.findIndex(
    (p) => p.pool.toString() === poolAddress.toString(),
  );
  if (idx < 0) {
    console.log("openPositions:", openPositions);
    console.warn("No position found for pool:", poolAddress);
    return;
  }
  const pool = openPositions[idx];
  if (pool.posClosed) {
    updateTotalPnl();
    console.log(`Pool ${poolAddress} has position closed.`);
    return;
  }

  chrome.storage.local.get("pnlSlider", (data) => {
    if (!data) data = 500;
    watchPool(poolAddress);
    pnlIntervalId = setInterval(updateTotalPnl, data.pnlSlider);
  });
}

export async function updateTotalPnl() {
  console.log("Updating total PnL...");
  try {
    const boughtText = document.getElementById("boughtText");
    const soldText = document.getElementById("soldText");
    const holdText = document.getElementById("holdText");
    const positionEl = document.getElementById("pnlText");
    const sellsTab = document.getElementById("Sells");

    if (!isConnected) {
      console.warn("WebSocket not connected, attempting to reconnect...");
      if (pnlIntervalId) {
        clearInterval(pnlIntervalId);
        pnlIntervalId = null;
      }
      return;
    }
    if (!currentPool) throw new Error("No active token set");
    if (!boughtText || !soldText || !holdText || !positionEl || !sellsTab)
      throw new Error("Required DOM element missing");
    if (!openPositions || !Array.isArray(openPositions))
      throw new Error("Open positions not found or invalid");

    const pos = openPositions.find(
      (p) => p.pool.toString() === currentPool.toString(),
    );
    if (!pos)
      throw new Error("No position found for current pool: " + currentPool);

    const {
      quantityHeld,
      quantitySold,
      amountBought,
      amountSold,
      avgEntry,
      realizedPNL,
      totalSOLSpent,
      posClosed,
    } = pos;

    // Show/hide sells tab
    if (quantityHeld <= 0 && !document.body.classList.contains("edit-mode"))
      sellsTab.classList.add("hidden");
    else sellsTab.classList.remove("hidden");

    // Get current price in SOL
    let currentPrice = 0,
      totalPNL,
      unrealizedPNL = 0,
      totalSpent,
      pnlPercent;

    if (!posClosed) {
      const pool = watchedPools.get(currentPool);
      currentPrice = pool?.price;
      if (!currentPrice)
        console.error("Current price not found for pool:", currentPool);
      else unrealizedPNL = quantityHeld * (currentPrice - avgEntry);
    }

    // Total PNL = realized + unrealized
    totalPNL = realizedPNL + unrealizedPNL;

    // Percentage relative to total SOL spent buying tokens
    totalSpent = totalSOLSpent;
    pnlPercent = totalSpent > 0 ? (totalPNL / totalSpent) * 100 : 0;
    updateDOM(
      { positionEl, boughtText, soldText, holdText },
      totalPNL,
      pnlPercent,
      totalSOLSpent,
      amountSold,
      quantityHeld,
      currentPrice,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(
      getDebugMode() ? "[pnlHandler.js]" + message : message,
      "error",
    );
  }
}

function updateDOM(
  { positionEl, boughtText, soldText, holdText },
  totalPNL,
  pnlPercent,
  totalSOLSpent,
  amountSold,
  quantityHeld,
  currentPrice,
) {
  // Update DOM
  positionEl.classList.remove("positive", "negative");
  positionEl.textContent = `${totalPNL.toFixed(2)} (${pnlPercent.toFixed(2)}%)`;
  positionEl.classList.add(totalPNL >= 0 ? "positive" : "negative");

  boughtText.textContent = `${totalSOLSpent.toFixed(2)}`;
  soldText.textContent = `${amountSold.toFixed(2)} `;
  holdText.textContent = `${(quantityHeld * currentPrice).toFixed(2)}`;
}

export async function importTradeLog(variables) {
  try {
    const dataManager = new DataManager(variables);
    let tradeLog = await dataManager.getTradeLog();
    if (!tradeLog) return;
    tradeLog = tradeLog.tokens;
    console.log("Importing trade log:", tradeLog);
    if (!tradeLog || !Array.isArray(tradeLog) || tradeLog.length === 0) {
      console.warn("No trade log found or invalid format");
      return;
    }
    openPositions.length = 0;
    openPositions.push(...tradeLog);
    localStorage.setItem("openPositions", JSON.stringify(openPositions));
  } catch (err) {
    console.error("Error importing trade log:", err);
    return;
  }
}
export function isActiveToken() {
  return currentPool !== null;
}

export function clearPositions(global = true) {
  const positionEl = document.getElementById("pnlText");
  if (positionEl == null) {
    console.warn("Position element not found in DOM");
    return;
  }
  if (pnlIntervalId) {
    clearInterval(pnlIntervalId);
    pnlIntervalId = null;
  }
  currentPool = null;
  openPositions.length = 0;
  positionEl.classList.remove("positive", "negative");
  positionEl.textContent = "0.00 SOL (0.00%)";
  if (global) localStorage.removeItem("openPositions");
}
