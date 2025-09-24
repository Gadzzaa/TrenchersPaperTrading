import { showNotification } from "./utils.js";
import { getDebugMode } from "../config.js";
import { getFromStorage } from "./utils.js";
import { getTradeLog } from "./API.js";
import CONFIG from "../config.js";
const openPositions = [];
let currentPool = null;
let pnlDataArray = [];
const watchedPools = new Map();
let ws;
let isConnected = false;
let pnlIntervalId = null;

export function setPnlData(poolAddress, pnlData) {
  const idx = pnlDataArray.findIndex((p) => p.poolAddress === poolAddress);
  if (idx >= 0) {
    console.warn("Pnl data for pool already exists:", poolAddress);
    return;
  }
  pnlDataArray.push({ poolAddress, ...pnlData });
}
function getPnlData(poolAddress) {
  const data = pnlDataArray.find((p) => p.poolAddress === poolAddress);
  return data || null;
}

async function connectWebSocket() {
  ws = new WebSocket(CONFIG.WS_URL);
  const token = await getFromStorage("sessionToken");

  ws.onopen = () => {
    console.log("🔄 WebSocket connecting...");
    ws.send(
      JSON.stringify({
        type: "authenticate",
        token: token,
      }),
    );
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "authenticated":
          isConnected = true;
          console.log("✅ WebSocket connected and authenticated");
          break;
        case "poolUpdate":
          console.log("Received pool update:", data);
          const pool = watchedPools.get(data.poolAddress);
          if (pool) {
            pool.price = data.price;
            pool.liquidity = data.liquidity;
          } else {
            ws.send(JSON.stringify({ type: "unwatchPool", poolAddress }));
          }
          break;

        case "pong":
          console.log("Received pong from server");
          break;

        default:
          console.warn("Unknown message type:", data.type, data);
      }
    } catch (err) {
      console.error("Error parsing WS message:", err);
    }
  };

  ws.onclose = () => {
    console.log("🛑 WebSocket disconnected, retrying in 3s...");
    isConnected = false;
    setTimeout(connectWebSocket, 3000); // reconnect automatically
  };

  ws.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };
}

export function watchPool(poolAddress) {
  if (!watchedPools.has(poolAddress)) {
    // add pool to local map with empty data
    watchedPools.set(poolAddress, { price: null, liquidity: null });

    // send watch request to backend
    const data = getPnlData(poolAddress);
    ws.send(JSON.stringify({ type: "watchPool", poolAddress, poolData: data }));
  }
}

export function unwatchPool(poolAddress) {
  if (watchedPools.has(poolAddress)) {
    ws.send(JSON.stringify({ type: "unwatchPool", poolAddress }));
    watchedPools.delete(poolAddress);
  }
}

connectWebSocket();

export function setActiveToken(poolAddress) {
  if (pnlIntervalId) clearInterval(pnlIntervalId);

  currentPool = poolAddress;
  const idx = openPositions.findIndex((p) => p.pool === poolAddress);
  if (idx < 0) {
    console.log("openPositions:", openPositions);
    console.warn("No position found for pool:", poolAddress);
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

    if (!isConnected) throw new Error("WebSocket not connected");
    if (!currentPool) throw new Error("No active token set");
    if (!boughtText || !soldText || !holdText || !positionEl || !sellsTab)
      throw new Error("Required DOM element missing");
    if (!openPositions || !Array.isArray(openPositions))
      throw new Error("Open positions not found or invalid");

    const pos = openPositions.find((p) => p.pool === currentPool);
    if (!pos)
      throw new Error("No position found for current pool: " + currentPool);

    const {
      avgEntry,
      realizedPNL,
      quantityHeld,
      quantitySold,
      valueBought,
      valueSold,
    } = pos;

    // Show/hide sells tab
    if (quantityHeld <= 0 && !document.body.classList.contains("edit-mode"))
      sellsTab.classList.add("hidden");
    else sellsTab.classList.remove("hidden");

    // Get current price in SOL
    const pool = watchedPools.get(currentPool);
    let currentPrice = pool?.price || 0;
    if (!currentPrice)
      console.error("Current price not found for pool:", currentPool);

    // Unrealized PNL in SOL
    const unrealizedPNL = quantityHeld * (currentPrice - avgEntry);

    // Total PNL = realized + unrealized
    const totalPNL = realizedPNL + unrealizedPNL;

    // Percentage relative to total SOL spent buying tokens
    const totalSpent = valueBought; // use valueBought (SOL spent buying tokens)
    const pnlPercent = totalSpent > 0 ? (totalPNL / totalSpent) * 100 : 0;

    // Update DOM
    positionEl.classList.remove("positive", "negative");
    positionEl.textContent = `${totalPNL.toFixed(2)} (${pnlPercent.toFixed(2)}%)`;
    positionEl.classList.add(totalPNL >= 0 ? "positive" : "negative");

    boughtText.textContent = `${valueBought.toFixed(2)}`;
    soldText.textContent = `${valueSold.toFixed(2)} `;
    holdText.textContent = `${(quantityHeld * currentPrice).toFixed(2)}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showNotification(
      getDebugMode() ? "[pnlHandler.js]" + message : message,
      "error",
    );
  }
}

export async function importTradeLog() {
  try {
    let tradeLog = await getTradeLog();
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
    showNotification(
      getDebugMode()
        ? "[pnlHandler.js] Error importing trade log: " + err.message
        : "Error importing trade log",
      "error",
    );
  }
}
export function isActiveToken() {
  return currentMint !== null;
}

export function clearPositions(global = true) {
  const positionEl = document.getElementById("pnlText");
  if (positionEl == null)
    throw new Error("[pnlHandler.js]: position element not found");
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
