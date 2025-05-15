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
    localStorage.removeItem('loggedInUsername');
    localStorage.removeItem('sessionToken');
    clearPositions(); // Clear positions
    window.location.href = 'account.html';
  });
});

export async function resetAccount(input) {
  try {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    let resp, data;

    // RESET
    resp = await fetch(`http://localhost:3000/api/reset/:${loggedInUsername}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Reset failed');
    // SET BALANCE
    const amount = input;
    if (isNaN(amount) || amount < 1) {
      throw new Error('Invalid amount—must be a number ≥ 1');
    }
    resp = await fetch('http://localhost:3000/api/set-balance', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount })
    });
    data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Set balance failed');
    clearPositions(); // Clear positions
    // Refresh your UI
    await updateBalanceUI();
    if (dropdownOpen) {
      accountDropdown.style.animation = 'dropdownCollapse 0.3s ease forwards';
      setTimeout(() => {
        accountDropdown.style.opacity = '0';
        accountDropdown.style.pointerEvents = 'none';
      }, 300);
    }
    dropdownOpen = false;
  } catch (err) {
    console.error('Manage balance error:', err);
  } finally {
    hideSpinner();
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('sessionToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}


