// Importing Presets
const defaultPreset = document.getElementById('preset1'); // Assuming P1 has id 'preset1'
import { applyPreset, loadPresets, getActivePreset } from './presetManager.js'; // Importing Preset Functions

import { showNotification } from './notificationSystem.js'; // Importing Notification Functions

import { showSpinner, hideSpinner } from './spinner.js'; // Importing Spinner Functions

const actionButtons = document.querySelectorAll('.buyButtons button, .sellButtons button');
const accountNameButton = document.getElementById('accountNameBtn');

let loggedInUsername;

document.addEventListener('DOMContentLoaded', function() {
  loggedInUsername = localStorage.getItem('loggedInUsername');

  if (!loggedInUsername) {
    window.location.href = 'account.html';
  } else {
    console.log("[dashboard.js] Logged in as:", loggedInUsername);
    accountNameButton.innerText = loggedInUsername;
    loadPresets(); // Load presets from localStorage
    if (defaultPreset) {
      defaultPreset.classList.add('activePreset');
    }
    applyPreset(getActivePreset()); // Load default preset on page load
  }
});

actionButtons.forEach(button => {
  button.addEventListener('click', () => {
    showSpinner();

    // Simulate "server delay"
    setTimeout(() => {
      hideSpinner();
      const action = button.dataset.action;
      const amount = button.dataset.amount;
      const symbol = button.dataset.symbol;

      if (action && amount && symbol) {
        if (action === 'buy') {
          showNotification(`You bought ${amount} ${symbol}!`, 'success');
        } else if (action === 'sell') {
          showNotification(`You sold ${amount} ${symbol}!`, 'error');
        }
      } else {
        showNotification(`Action complete!`, 'info');
      }
    }, 2000); // 2 seconds fake loading
  });
});

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

