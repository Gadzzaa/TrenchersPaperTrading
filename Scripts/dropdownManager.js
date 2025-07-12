import { showSpinner, hideSpinner } from './spinner.js';
import { showNotification } from './notificationSystem.js';
import { updateBalanceUI } from './dashboard.js';
import { clearPositions } from './pnlHandler.js'; // Importing PnL Functions
const accountNameBtn = document.getElementById('accountNameBtn');
const accountDropdown = document.querySelector('.accountDropdown');
const signOutBtn = document.getElementById('signOutBtn');
const resetAccBtn = document.getElementById('resetAccBtn');
let dropdownOpen = false;
document.addEventListener('DOMContentLoaded', () => {
  if (!accountNameBtn) return;
  accountNameBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop event bubbling

    if (!dropdownOpen) {
      // Open dropdown
      accountDropdown.style.animation = 'dropdownExpand 0.3s ease forwards';
      accountDropdown.style.opacity = '1';
      accountDropdown.style.pointerEvents = 'auto';
      dropdownOpen = true;
    } else {
      // Close dropdown
      accountDropdown.style.animation = 'dropdownCollapse 0.3s ease forwards';
      setTimeout(() => {
        accountDropdown.style.opacity = '0';
        accountDropdown.style.pointerEvents = 'none';
      }, 300); // Wait for collapse animation
      dropdownOpen = false;
    }
  });

  // Close dropdown if click outside
  document.addEventListener('click', (e) => {
    if (dropdownOpen && !accountNameBtn.contains(e.target) && !accountDropdown.contains(e.target)) {
      accountDropdown.style.animation = 'dropdownCollapse 0.3s ease forwards';
      setTimeout(() => {
        accountDropdown.style.opacity = '0';
        accountDropdown.style.pointerEvents = 'none';
      }, 300);
      dropdownOpen = false;
    }
  });


  resetAccBtn.addEventListener('click', async () => {
    // Ask the user what they want to do:
    //   • leave blank or type "reset" → reset portfolio
    //   • enter a number ≥ 1 → set new balance
    const input = prompt(
      `Enter a new SOL balance (≥1),\n`
    );
    if (input === null) return; // user clicked Cancel

    showSpinner();
    resetAccount(parseFloat(input))
      .then(() => {
        showNotification('✅ Account reset successfully!', 'success');
      })
      .catch((err) => {
        console.error('Error resetting account:', err);
        showNotification(`❌ ${err.message}`, 'error');
      })
      .finally(() => {
        hideSpinner();
      });
  });

  signOutBtn.addEventListener('click', () => {
    localStorage.removeItem('username');
    localStorage.removeItem('sessionToken');
    clearPositions(); // Clear positions
    window.location.href = 'account.html';
  });
});




