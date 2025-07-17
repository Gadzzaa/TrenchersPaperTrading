import { requestPrice } from "./utils.js";
const openPositions = [];
let currentMint = null;
let currentPosition = null;
let pnlIntervalId = null;

export function setActiveToken(mint, entryPrice, quantity) {
  // TODO: Remake inside dashboard when page is loaded
  localStorage.setItem("currentMint", mint);

  const positionEl = document.getElementById("pnlText");
  if (positionEl && currentMint != mint) {
    positionEl.classList.remove("positive", "negative");
    positionEl.textContent = "0.00 SOL (0.00%)";
  }

  // If mint is invalid or quantity is zero, reset the active token and stop PNL updates
  if (!mint || quantity <= 0) {
    currentMint = null;
    currentPosition = null;
    if (pnlIntervalId) clearInterval(pnlIntervalId);
    pnlIntervalId = null;
    return;
  }

  currentMint = mint;
  currentPosition = { mint, entryPrice, quantity };

  if (pnlIntervalId) clearInterval(pnlIntervalId);
  pnlIntervalId = setInterval(updateUnrealizedPnl, 250);
}

export async function updateUnrealizedPnl() {
  try {
    const positionEl = document.getElementById("pnlText");
    if (!currentPosition || !currentMint) return;
    if (!positionEl) return;

    const { entryPrice, quantity } = currentPosition;
    const currentPrice = await requestPrice(currentMint);
    const entryValue = entryPrice * quantity; // totalCost
    const value = currentPrice * quantity; // totalValue
    const pnl = value - entryValue;
    const pnlProcent = value > 0 ? (pnl / value) * 100 : 0;

    positionEl.classList.remove("positive", "negative");
    positionEl.textContent = `${pnl.toFixed(2)} SOL (${pnlProcent.toFixed(2)}%)`;
    positionEl.classList.add(pnl >= 0 ? "positive" : "negative");
  } catch (err) {
    throw new Error("Failed to update PnL: " + err);
  }
}
export async function recordBuy(mint, entryPrice, solSpent) {
  console.log(
    "recordBuy called with:" +
      typeof mint +
      typeof entryPrice +
      typeof solSpent,
  );
  if (
    typeof mint !== "string" ||
    typeof entryPrice != "number" ||
    typeof solSpent != "number"
  ) {
    console.error("recordBuy: invalid arguments", {
      mint,
      entryPrice,
      solSpent,
    });
    return;
  }

  const quantity = solSpent / entryPrice;

  const idx = openPositions.findIndex((p) => p.mint === mint);
  if (idx >= 0) {
    const pos = openPositions[idx];
    const existingCost = pos.entryPrice * pos.quantity;
    const cost = entryPrice * quantity;
    const totalQty = pos.quantity + quantity;
    const totalCost = existingCost + cost;
    pos.quantity = totalQty;
    pos.entryPrice = totalCost / totalQty;
    setActiveToken(mint, pos.entryPrice, pos.quantity);
  } else {
    openPositions.push({ mint, entryPrice, quantity });
    setActiveToken(mint, entryPrice, quantity);
  }

  localStorage.setItem("openPositions", JSON.stringify(openPositions));

  document.getElementById("Sells").classList.remove("hidden");
}

export async function recordSell(mint, exitPrice, quantityPercent) {
  if (
    typeof mint !== "string" ||
    typeof exitPrice !== "number" ||
    typeof quantityPercent !== "number" ||
    exitPrice <= 0
  ) {
    console.error("recordSell: invalid arguments", {
      mint,
      exitPrice,
      quantityPercent,
    });
    return;
  }

  const idx = openPositions.findIndex((p) => p.mint === mint);
  if (idx < 0) {
    console.warn(`recordSell: no position found for ${mint}`);
    return;
  }

  const pos = openPositions[idx];

  let sellQty = (quantityPercent / 100) * pos.quantity;

  if (sellQty <= 0) {
    console.warn(`recordSell: nothing to sell for ${mint}`);
    return;
  }

  pos.quantity -= sellQty;

  const sellsTab = document.getElementById("Sells");
  if (parseFloat(pos.quantity.toFixed(9)) === 0) {
    setActiveToken(null);
    sellsTab.classList.add("hidden");
  } else setActiveToken(mint, pos.entryPrice, pos.quantity);

  localStorage.setItem("openPositions", JSON.stringify(openPositions));
}

export async function loadPositions() {
  clearPositions(false);
  const storedPositions = localStorage.getItem("openPositions");
  if (storedPositions) {
    try {
      const parsedPositions = JSON.parse(storedPositions);
      openPositions.push(...parsedPositions);
    } catch (error) {
      console.error("Error parsing positions from localStorage:", error);
    }
  } else {
    console.log("No positions found in localStorage.");
  }
}

export function clearPositions(global = true) {
  const positionEl = document.getElementById("pnlText");
  if (positionEl == null) {
    console.error("[pnlHandler.js]: position element not found");
    return;
  }
  if (pnlIntervalId) {
    clearInterval(pnlIntervalId);
    pnlIntervalId = null;
  }
  currentMint = null;
  currentPosition = null;
  openPositions.length = 0;
  positionEl.classList.remove("positive", "negative");
  positionEl.textContent = "0.00 SOL (0.00%)";
  if (global) localStorage.removeItem("openPositions");
}
