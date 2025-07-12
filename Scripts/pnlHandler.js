import { requestPrice } from "./utils.js";
const openPositions = [];
let currentMint = null;
let currentPosition = null;
let pnlIntervalId = null;

export function setActiveToken(mint, entryPrice, quantity) {
  localStorage.setItem("currentMint", mint);

  const positionEl = document.getElementById("position");
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
  if (!currentPosition || !currentMint) return;

  try {
    const { entryPrice, quantity } = currentPosition;
    const currentPrice = await requestPrice(currentMint);
    const totalCost = entryPrice * quantity;
    const totalValue = currentPrice * quantity;
    const totalPnl = totalValue - totalCost;
    const pnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    const positionEl = document.getElementById("position");
    if (!positionEl) return;

    positionEl.classList.remove("positive", "negative");
    positionEl.textContent = `${totalPnl.toFixed(2)} SOL (${pnlPct.toFixed(2)}%)`;
    positionEl.classList.add(totalPnl >= 0 ? "positive" : "negative");
  } catch (err) {
    console.error("[pnlHandler] Failed to update PnL:", err);
  }
}
export async function recordBuy(mint, entryPrice, solSpent) {
  if (typeof mint !== "string") {
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
    // Accumulate into existing: compute new weighted-entry
    const existing = openPositions[idx];
    const totalQty = existing.quantity + quantity;
    const totalCost =
      existing.entryPrice * existing.quantity + entryPrice * quantity;
    existing.quantity = totalQty;
    existing.entryPrice = totalCost / totalQty;
  } else {
    // New position
    openPositions.push({ mint, entryPrice, quantity });
  }

  const updated = openPositions.find((p) => p.mint === mint);
  setActiveToken(mint, updated.entryPrice, updated.quantity);
  await updateUnrealizedPnl();
  localStorage.setItem("openPositions", JSON.stringify(openPositions));
}

export async function recordSell(
  mint,
  exitPrice,
  quantitySold = 0,
  quantityPercent = 0,
) {
  if (
    typeof mint !== "string" ||
    typeof exitPrice !== "number" ||
    exitPrice <= 0
  ) {
    console.error("recordSell: invalid arguments", {
      mint,
      exitPrice,
      quantitySold,
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
  let sellQty;

  if (quantityPercent === 100) {
    sellQty = pos.quantity;
  } else {
    sellQty = quantitySold;
  }

  if (sellQty <= 0) {
    console.warn(`recordSell: nothing to sell for ${mint}`);
    return;
  }

  pos.quantity -= sellQty;

  if (parseFloat(pos.quantity.toFixed(8)) === 0) {
    openPositions.splice(idx, 1);
    setActiveToken(null);
  } else {
    const updated = openPositions.find((p) => p.mint === mint);
    setActiveToken(mint, updated.entryPrice, updated.quantity);
  }
  await updateUnrealizedPnl();
  localStorage.setItem("openPositions", JSON.stringify(openPositions));
}
export async function removePosition(mint) {
  const idx = openPositions.findIndex((p) => p.mint === mint);
  if (idx >= 0) {
    openPositions.splice(idx, 1);
  } else {
    console.warn(`Position not found: ${mint}`);
  }

  await updateUnrealizedPnl();
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
