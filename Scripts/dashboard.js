// Importing Presets
import { applyPreset, loadPresets, getActivePreset } from './presetManager.js'; // Importing Preset Functions

import { showNotification } from './notificationSystem.js'; // Importing Notification Functions

import { checkSession } from './sessionChecker.js'; // Importing Session Functions

import { showSpinner, hideSpinner } from './spinner.js'; // Importing Spinner Functions

import { getPortfolio } from './portfolioHandler.js'; // Importing Balance Functions

import { buyToken } from './buyHandler.js'; // Importing Buy Functions
import { sellByPercentage } from './sellHandler.js'; // Importing Sell Functions

import { updateUnrealizedPnl, recordBuy, recordSell, loadPositions, removePosition } from './pnlHandler.js'; // Importing PnL Functions

const actionButtons = document.querySelectorAll('.buyButtons button, .sellButtons button');

document.addEventListener('DOMContentLoaded', async () => {
  const defaultPreset = document.getElementById('preset1'); // Assuming P1 has id 'preset1'
  const sessionToken = localStorage.getItem('sessionToken');
  const loggedInUsername = localStorage.getItem('loggedInUsername');

  console.log("[dashboard.js] Session Token:", sessionToken);

  if (!sessionToken) {
    console.warn("[dashboard.js] No session token found. Redirecting...");
    window.location.href = 'account.html';
    return;
  }

  // 🔥 Check if session is really valid
  const isSessionValid = await checkSession();

  if (!isSessionValid) {
    console.warn("[dashboard.js] Session token invalid. Redirecting...");
    localStorage.removeItem('sessionToken'); // Clean it
    window.location.href = 'account.html';
    return;
  }

  // 🔥 If still valid, continue loading dashboard
  console.log("[dashboard.js] Logged in as:", loggedInUsername);
  const accountNameButton = document.getElementById('accountNameBtn'); // Make sure button exists
  if (accountNameButton && loggedInUsername) {
    accountNameButton.innerText = loggedInUsername;
  }

  await updateBalanceUI(); // Update balance on page load
  loadPresets(); // Load presets from localStorage
  if (defaultPreset) {
    defaultPreset.classList.add('activePreset');
  }
  applyPreset(getActivePreset()); // Load default preset on page load

  loadPositions();
  requestAnimationFrame(animateUnrealizedPnl);
  // refresh periodically if you like:
  setInterval(updateUnrealizedPnl, 250);
});
function animateUnrealizedPnl() {
  updateUnrealizedPnl();
  requestAnimationFrame(animateUnrealizedPnl);
}
actionButtons.forEach(button => {
  button.addEventListener('click', async () => {
    showSpinner();
    button.disabled = true;

    const action = button.dataset.action;
    const solSpent = parseFloat(button.dataset.amount);
    if (isNaN(solSpent)) {
      showNotification('❌ Invalid amount provided.', 'error');
      return;
    }
    const price = await requestPrice(); // Fetch the price of the token
    if (price == null) {
      console.warn('❌ Failed to fetch token price: ', price);
      showNotification('❌ Token price is not an integer.', 'error');
      hideSpinner();
      return;
    }
    const tokenMint = await requestCurrentContract();
    if (!tokenMint) {
      showNotification('❌ No contract loaded.', 'error');
      hideSpinner();
      return;
    }

    console.log('Action:', action);
    console.log('Sol Spent:', solSpent);
    console.log('Symbol:', symbol);
    console.log('Price:', price);
    console.log('Token Mint:', tokenMint);

    if (action && solSpent && symbol && tokenMint) {
      try {
        if (action === 'buy') {
          const result = await buyToken(tokenMint, solSpent, price);

          if (result) {
            showNotification(`✅ You bought ${parseFloat(result.tokensReceived).toFixed(2)} ${symbol}!`, 'success');
            await recordBuy(tokenMint, parseFloat(price), solSpent); // Add to open positions
            await updateBalanceUI();
          } else {
            showNotification('❌ Failed to buy token.', 'error');
          }

        } else if (action === 'sell') {
          const result = await sellByPercentage(tokenMint, solSpent, price);

          if (result) {
            showNotification(`✅ You sold ${parseFloat(result.tokensSold).toFixed(2)} ${symbol} for ${parseFloat(result.solReceived).toFixed(2)} SOL!`, 'success');
            await recordSell(tokenMint, parseFloat(price), result.tokensSold, solSpent); // Remove from open positions
            await updateBalanceUI();
          } else {
            showNotification('❌ Failed to sell token.', 'error');
            removePosition(tokenMint); // Remove from open positions
          }
        } else {
          showNotification('❓ Unknown action.', 'error');
        }
      } catch (error) {
        console.error('Action error:', error);
        showNotification('❌ Server error during action.', 'error');
      }
    } else {
      showNotification(`❓ Missing button data attributes.`, 'error');
    }

    button.disabled = false;
    hideSpinner();
  });
});

export function requestSymbol() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      reject('Timeout waiting for SYMBOL_RESPONSE');
    }, 5000);
    const requestId = 'get-symbol-' + Date.now();

    // Listen for response
    function handleMessage(event) {
      const { type, symbol, requestId: responseId } = event.data;
      if (type === 'SYMBOL_RESPONSE' && responseId === requestId) {
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        resolve(symbol);
      }
    }

    window.addEventListener('message', handleMessage);

    // Send request
    window.parent.postMessage({
      type: 'SYMBOL_REQUEST',
      requestId: requestId
    }, '*');
  });
}
export function requestPrice() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      reject('Timeout waiting for PRICE_RESPONSE');
    }, 5000);

    const requestId = 'get-price-' + Date.now();

    // Listen for response
    function handleMessage(event) {
      const { type, price, requestId: responseId } = event.data;
      if (type === 'PRICE_RESPONSE' && responseId === requestId) {
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        resolve(price);
      }
    }

    window.addEventListener('message', handleMessage);

    // Send request
    window.parent.postMessage({
      type: 'PRICE_REQUEST',
      requestId: requestId
    }, '*');
  });
}
export function requestCurrentContract() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      reject('Timeout waiting for CONTRACT_RESPONSE');
    }, 5000);

    const requestId = 'get-contract-' + Date.now();

    // Listen for response
    function handleMessage(event) {
      const { type, contract, requestId: responseId } = event.data;
      if (type === 'CONTRACT_RESPONSE' && responseId === requestId) {
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        resolve(contract);
      }
    }

    window.addEventListener('message', handleMessage);

    // Send request
    window.parent.postMessage({
      type: 'CONTRACT_REQUEST',
      requestId: requestId
    }, '*');
  });
}
export async function updateBalanceUI() {
  const solBalance = document.getElementById('balance');
  const result = await getPortfolio(); // must await
  if (result) {
    solBalance.innerText = parseFloat(result.solBalance).toFixed(2);
    triggerPulse('balance');
  } else {
    console.error('Failed to fetch balance');
  }
}

function triggerPulse(elementId) {
  const el = document.getElementById(elementId);
  console.log('Triggering pulse for:', elementId);
  if (!el) return;
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}
