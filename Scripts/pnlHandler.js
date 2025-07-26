import { requestPrice } from "./utils.js";
const openPositions = [];
let currentMint = null;
let pnlIntervalId = null;

export function setActiveToken(mint) {
  if (pnlIntervalId) clearInterval(pnlIntervalId);

  currentMint = mint;
  const idx = openPositions.findIndex((p) => p.mint === mint);
  if (idx < 0) {
    console.warn("No position found for mint:", mint);
    return;
  }
  const pos = openPositions[idx];
  const quantity = pos.quantity;
  if (quantity <= 0) document.getElementById("Sells").classList.add("hidden");
  else document.getElementById("Sells").classList.remove("hidden");

  pnlIntervalId = setInterval(updateTotalPnl, 250);
}

export async function updateTotalPnl() {
  try {
    const boughtText = document.getElementById("boughtText");
    const soldText = document.getElementById("soldText");
    const holdText = document.getElementById("holdText");
    const positionEl = document.getElementById("pnlText");
    if (!currentMint) throw new Error("No active token set");
    if (!boughtText) throw new Error("Bought text element not found");
    if (!soldText) throw new Error("Sold text element not found");
    if (!holdText) throw new Error("Hold text element not found");
    if (!positionEl) throw new Error("Position element not found");
    if (!openPositions || !Array.isArray(openPositions))
      throw new Error("Open positions not found or invalid");
    const idx = openPositions.findIndex((p) => p.mint === currentMint);
    if (idx < 0)
      throw new Error("No position found for current mint: " + currentMint);
    const pos = openPositions[idx];
    const entryPrice = pos.entryPrice;
    const quantity = pos.quantity;
    const realizedPnl = pos.realizedPnl;
    const totalSpent = pos.totalSpent;
    const totalSold = pos.totalSold;

    const currentPrice = await requestPrice(currentMint);
    const entryValue = entryPrice * quantity;
    const value = currentPrice * quantity;
    const pnl = value - entryValue;
    const totalPnl = realizedPnl + pnl;
    const pnlProcent = totalSpent > 0 ? (totalPnl / totalSpent) * 100 : 0;

    positionEl.classList.remove("positive", "negative");
    positionEl.textContent = `${totalPnl.toFixed(2)} SOL (${pnlProcent.toFixed(2)}%)`;
    positionEl.classList.add(totalPnl >= 0 ? "positive" : "negative");
    boughtText.textContent = `${totalSpent.toFixed(2)}`;
    soldText.textContent = `${totalSold.toFixed(2)}`;
    holdText.textContent = `${value.toFixed(2)}`;
  } catch (err) {
    throw new Error("Failed to update PnL: " + err);
  }
}
export async function recordBuy(mint, entryPrice, solSpent) {
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
    pos.totalSpent += solSpent;
  } else {
    openPositions.push({
      mint,
      entryPrice,
      quantity,
      realizedPnl: 0,
      totalSpent: solSpent,
      totalSold: 0,
    });
    setActiveToken(mint);
  }
  localStorage.setItem("openPositions", JSON.stringify(openPositions));

  document.getElementById("Sells").classList.remove("hidden");
}

export async function recordSell(mint, exitValue, quantityPercent) {
  if (!mint) throw new Error("Mint is required for recordSell");
  if (!exitValue) throw new Error("Exit value is required for recordSell");
  if (!quantityPercent)
    throw new Error("Quantity percent is required for recordSell");

  const idx = openPositions.findIndex((p) => p.mint === mint);
  if (idx < 0) throw new Error(`No position found for mint: ${mint}`);

  const pos = openPositions[idx];

  let sellQty = (quantityPercent / 100) * pos.quantity;

  if (sellQty <= 0) throw new Error(`Nothing to sell for ${mint}`);

  const averageEntryPrice = pos.entryPrice;
  const entryValue = averageEntryPrice * sellQty;
  const sellPnl = exitValue - entryValue;

  pos.realizedPnl += sellPnl;
  pos.quantity -= sellQty;
  pos.totalSold += exitValue;

  const sellsTab = document.getElementById("Sells");
  if (parseFloat(pos.quantity.toFixed(9)) === 0) {
    sellsTab.classList.add("hidden");
  }

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
  openPositions.length = 0;
  positionEl.classList.remove("positive", "negative");
  positionEl.textContent = "0.00 SOL (0.00%)";
  if (global) localStorage.removeItem("openPositions");
}
