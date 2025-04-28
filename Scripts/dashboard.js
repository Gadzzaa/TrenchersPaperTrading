// Importing Presets
const defaultPreset = document.getElementById('preset1'); // Assuming P1 has id 'preset1'
import { applyPreset, loadPresets, getActivePreset } from './presetManager.js'; // Importing Preset Functions

import { showNotification } from './notificationSystem.js'; // Importing Notification Functions

import { showSpinner, hideSpinner } from './spinner.js'; // Importing Spinner Functions

import { getPortfolio } from './portofolioHandler.js'; // Importing Balance Functions

import { buyToken } from './buyHandler.js'; // Importing Buy Functions
import { sellByPercentage } from './sellHandler.js'; // Importing Sell Functions

const actionButtons = document.querySelectorAll('.buyButtons button, .sellButtons button');
const accountNameButton = document.getElementById('accountNameBtn');

const tokenMint = 'J8dRS5coBftCrhVcbH93cZq748jTBVp4ErtWgbnbpump'
let loggedInUsername;

document.addEventListener('DOMContentLoaded', function() {
  loggedInUsername = localStorage.getItem('loggedInUsername');

  if (!loggedInUsername) {
    window.location.href = 'account.html';
  } else {
    console.log("[dashboard.js] Logged in as:", loggedInUsername);
    accountNameButton.innerText = loggedInUsername;
    updateBalanceUI(); // Update balance on page load
    loadPresets(); // Load presets from localStorage
    if (defaultPreset) {
      defaultPreset.classList.add('activePreset');
    }
    applyPreset(getActivePreset()); // Load default preset on page load
  }
});
actionButtons.forEach(button => {
  button.addEventListener('click', async () => {
    showSpinner();

    const action = button.dataset.action;
    const amount = parseFloat(button.dataset.amount);
    const symbol = button.dataset.symbol;  // TODO: GRAB TOKEN SYMBOL AFTER PARSING

    if (action && amount && symbol && tokenMint) {
      try {
        if (action === 'buy') {
          const result = await buyToken(tokenMint, amount);

          if (result) {
            showNotification(`✅ You bought ${result.tokensReceived.toFixed(2)} ${symbol}!`, 'success');
            await updateBalanceUI();
          } else {
            showNotification('❌ Failed to buy token.', 'error');
          }

        } else if (action === 'sell') {
          const result = await sellByPercentage(tokenMint, amount);

          if (result) {
            showNotification(`✅ You sold ${result.tokensSold.toFixed(2)} ${symbol} for ${result.solReceived.toFixed(2)} SOL!`, 'success');
            await updateBalanceUI();
          } else {
            showNotification('❌ Failed to sell token.', 'error');
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

    hideSpinner();
  });
});
export async function updateBalanceUI() {
  const solBalance = document.getElementById('balance');
  const result = await getPortfolio(); // must await
  if (result) {
    solBalance.innerText = result.solBalance;
    triggerPulse('balance');
  } else {
    console.error('Failed to fetch balance');
  }
}
function triggerPulse(elementId) {
  const element = document.getElementById(elementId);
  element.classList.remove('pulse');
  void element.offsetWidth; // re-trigger animation
  element.classList.add('pulse');
}

// Example usage when you update:
/*
document.getElementById('balance').innerText = '1200';
triggerPulse('balance');

document.getElementById('position').innerText = '3';
triggerPulse('position');
*/

