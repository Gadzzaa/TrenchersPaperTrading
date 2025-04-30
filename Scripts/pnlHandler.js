import { requestPrice } from './dashboard.js';
const openPositions = [];
export async function updateUnrealizedPnl() {
  let totalCost = 0, totalValue = 0;

  for (const pos of openPositions) {
    const { mint, entryPrice, quantity } = pos;
    const currentPrice = await requestPrice(mint);
    totalCost += entryPrice * quantity;
    totalValue += currentPrice * quantity;
  }

  const totalPnl = (totalValue - totalCost);
  const pnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  // Update the DOM
  const position = document.getElementById('position');
  position.classList.remove('positive', 'negative');
  position.textContent = `${totalPnl.toFixed(2)} SOL (${pnlPct.toFixed(2)}%)`;
  if (totalPnl >= 0) {
    position.classList.add('positive');
  }
  else {
    position.classList.add('negative');
  }
}

export async function recordBuy(mint, entryPrice, solSpent) {
  // 1) Validate inputs
  if (
    typeof mint !== 'string'
  ) {
    console.error('recordBuy: invalid arguments', { mint, entryPrice, solSpent });
    return;
  }

  // 2) Derive how many tokens that bought
  const quantity = solSpent / entryPrice;

  // 3) Find existing position
  const idx = openPositions.findIndex(p => p.mint === mint);
  if (idx >= 0) {
    // Accumulate into existing: compute new weighted-entry
    const existing = openPositions[idx];
    const totalQty = existing.quantity + quantity;
    const totalCost = existing.entryPrice * existing.quantity + entryPrice * quantity;
    existing.quantity = totalQty;
    existing.entryPrice = totalCost / totalQty;
  } else {
    // New position
    openPositions.push({ mint, entryPrice, quantity });
  }

  console.log(
    `Recorded buy: ${mint} – now ${openPositions.find(p => p.mint === mint).quantity.toFixed(6)} tokens @ ${openPositions.find(p => p.mint === mint).entryPrice.toFixed(6)}`
  );

  // 4) Refresh Unrealized PnL (assumes you have this function)
  await updateUnrealizedPnl();
  localStorage.setItem('openPositions', JSON.stringify(openPositions)); // Save to localStorage
}


export async function recordSell(mint, exitPrice, quantitySold = 0, quantityPercent = 0) {
  if (typeof mint !== 'string' || typeof exitPrice !== 'number' || exitPrice <= 0) {
    console.error('recordSell: invalid arguments', { mint, exitPrice, quantitySold, quantityPercent });
    return;
  }

  const idx = openPositions.findIndex(p => p.mint === mint);
  if (idx < 0) {
    console.warn(`recordSell: no position found for ${mint}`);
    return;
  }

  const pos = openPositions[idx];
  let sellQty;

  // If percent=100, fully close
  if (quantityPercent === 100) {
    sellQty = pos.quantity;
  } else {
    // otherwise use quantitySold
    sellQty = Math.min(quantitySold, pos.quantity);
  }

  if (sellQty <= 0) {
    console.warn(`recordSell: nothing to sell for ${mint}`);
    return;
  }

  // 1) Realized PnL on this slice
  const costBasis = pos.entryPrice * sellQty;
  const proceeds = exitPrice * sellQty;
  const realizedPnl = proceeds - costBasis;
  console.log(
    `Realized PnL for ${sellQty.toFixed(6)} ${mint}: ${realizedPnl.toFixed(6)} SOL`
  );

  // 2) Subtract from the position
  pos.quantity -= sellQty;

  // 3) Remove if fully sold
  if (pos.quantity <= 0) {
    openPositions.splice(idx, 1);
    console.log(`Position fully closed: ${mint}`);
  } else {
    console.log(
      `Position updated: ${mint} → ${pos.quantity.toFixed(6)} tokens remaining @ ${pos.entryPrice.toFixed(6)} SOL`
    );
  }

  // 4) Refresh your PnL display
  await updateUnrealizedPnl();
}
export async function removePosition(mint) {
  const idx = openPositions.findIndex(p => p.mint === mint);
  if (idx >= 0) {
    openPositions.splice(idx, 1);
    console.log(`Position removed: ${mint}`);
  } else {
    console.warn(`Position not found: ${mint}`);
  }

  // Refresh your PnL display
  await updateUnrealizedPnl();
}
export function loadPositions() {
  clearPositions(); // Clear existing positions
  const storedPositions = localStorage.getItem('openPositions');
  if (storedPositions) {
    try {
      const parsedPositions = JSON.parse(storedPositions);
      openPositions.push(...parsedPositions);
      console.log('Loaded positions from localStorage:', openPositions);
    } catch (error) {
      console.error('Error parsing positions from localStorage:', error);
    }
  } else {
    console.log('No positions found in localStorage.');
  }
}

export function clearPositions() {
  openPositions.length = 0; // Clear the array
  console.log('All positions cleared.');
  document.getElementById('position').textContent = '0.00 SOL (0.00%)'; // Reset UI
}
