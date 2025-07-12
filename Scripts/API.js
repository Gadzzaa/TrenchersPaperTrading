import { getPortfolio } from './portofolioHandler.js';
import { showNotification } from './notificationSystem.js';
import { showSpinner, hideSpinner } from './spinner.js';
import { updateBalanceUI } from './dashboard.js';
import { resetAccount } from './dropdownManager.js'; // Importing Reset Account Functions

// SessionChecker.js
export async function checkSession() {
  try {
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) {
      console.warn('⚠️ No session token found.');
      return false;
    }

    const response = await fetch('http://localhost:3000/api/check-session', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Server responded with error status:', response.status);
      return false;
    }

    const data = await response.json();
    return data.valid === true;

  } catch (error) {
    console.error('❌ Error checking session:', error);
    return false;
  }
}


// BuyHandler.js
export async function buyToken(tokenMint, solAmount, tokenPrice, slippage = 2, fee = 0.1) {
  try {
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) {
      throw new Error('No sessionToken found. Please log in again.');
    }

    const response = await fetch('http://localhost:3000/api/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        tokenMint,
        solAmount,
        tokenPrice,
        slippage,
        fee
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Token purchase successful:', result);
      console.log('Tokens received:', result.tokensReceived);
      console.log('SOL spent:', result.solSpent);
      console.log('Fees:', result.fees);
      return {
        tokensReceived: result.tokensReceived,
        solSpent: result.solSpent,
        fees: result.fees
      };
    } else {
      throw new Error(result.error || 'Buy failed');
    }

  } catch (error) {
    console.error('❌ Error buying token:', error.message);
    return null;
  }
}


// SellHandler.js
export async function sellByPercentage(tokenMint, percentage, price) {
  try {
    showSpinner();

    const portfolio = await getPortfolio();
    if (!portfolio || !portfolio.tokens) {
      throw new Error('Portfolio data invalid.');
    }

    const totalAmount = portfolio.tokens[tokenMint];
    if (!totalAmount) {
      showNotification('❌ No tokens found for this mint.', 'error');
      return;
    }

    const amountToSell = parseFloat((totalAmount * (percentage / 100)).toFixed(9));

    if (amountToSell <= 0) {
      showNotification('❌ No tokens to sell.', 'error');
      return;
    }

    console.log(`Selling ${amountToSell} tokens (${percentage}% of your ${tokenMint})`);

    const result = await sellToken(tokenMint, amountToSell, price);

    if (result) {
      showNotification(`✅ Sold ${result.tokensSold.toFixed(2)} tokens for ${result.solReceived.toFixed(2)} SOL!`, 'success');
      await updateBalanceUI();
      return result;
    } else {
      showNotification('❌ Sell failed.', 'error');
    }

  } catch (error) {
    console.error('❌ Error during sell by percentage:', error.message);
    showNotification('❌ Server error during selling.', 'error');
  } finally {
    hideSpinner();
  }
}

async function sellToken(tokenMint, tokenAmount, tokenPrice, slippage = 2, fee = 0.1) {
  try {
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) {
      throw new Error('No sessionToken found. Please log in again.');
    }

    const response = await fetch('http://localhost:3000/api/sell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        tokenMint,
        tokenAmount,
        tokenPrice,
        slippage,
        fee
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Token sale successful:', result);
      return {
        solReceived: result.solReceived,
        tokensSold: result.tokensSold,
        fees: result.fees
      };
    } else {
      throw new Error(result.error || 'Sell failed');
    }

  } catch (error) {
    console.error('❌ Error selling token:', error.message);
    return null;
  }
}


// PortfolioHandler.js
export async function getPortfolio() {
  try {
    const username = localStorage.getItem('loggedInUsername');
    const sessionToken = localStorage.getItem('sessionToken');
    if (!username) {
      throw new Error('No loggedInUsername found in localStorage');
    }
    if (!sessionToken) {
      throw new Error('No sessionToken found. Please log in again.');
    }

    const response = await fetch(`http://localhost:3000/api/portfolio/${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Full portfolio fetched:', data);

    return data; // 🛠 Return the WHOLE portfolio object!

  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return null;
  }
}


// ResetHandler.js
export async function resetAccount(accountDropdown, input) {
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
    if (accountDropdown) {
      accountDropdown.style.animation = 'dropdownCollapse 0.3s ease forwards';
      setTimeout(() => {
        accountDropdown.style.opacity = '0';
        accountDropdown.style.pointerEvents = 'none';
      }, 300);
    }
  } catch (err) {
    console.error('Manage balance error:', err);
  } finally {
    hideSpinner();
  }
}


// LoginHandler.js
export async function handleLogin(username, password, rememberMe) {

  if (!username || !password) {
    showNotification('Please fill in both fields.', 'error');
    return;
  }

  showSpinner();

  await new Promise(resolve => setTimeout(resolve, 600)); // 600ms small delay

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();


    if (response.ok) {
      showNotification('Login Successful', 'success');
      localStorage.setItem('loggedInUsername', username);
      localStorage.setItem('sessionToken', result.token);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
        hideSpinner();
      }, 1000);
    } else {
      showNotification(result.message || 'Login Failed', 'error');
      hideSpinner();
    }
  } catch (error) {
    hideSpinner();

    showNotification('Server Error', 'error');
    console.error('Login error:', error);
  }
  if (rememberMe) {
    localStorage.setItem('rememberedUsername', username);
  } else {
    localStorage.removeItem('rememberedUsername');
  }
}

// RegisterHandler.js
export async function handleRegister(username, password) {

  if (!username || !password) {
    showNotification('Please fill in both fields.', 'error');
    return;
  }

  showSpinner();

  await new Promise(resolve => setTimeout(resolve, 600)); // 600ms small delay

  try {
    const response = await fetch('http://localhost:3000/api/create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (response.ok) {
      showNotification('Account created successfully!', 'success');
      localStorage.setItem('loggedInUsername', username);
      localStorage.setItem('sessionToken', result.token);
      resetAccount(100); // 🔥 Reset account
      showNotification('You can now attempt to login.', 'success');
      hideSpinner();
    } else {
      showNotification(result.message || 'Registration failed.', 'error');
    }
  } catch (error) {
    hideSpinner();

    showNotification('Server Error', 'error');
    console.error('Register error:', error);
  }
  hideSpinner();
}


function getAuthHeaders() {
  const token = localStorage.getItem('sessionToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}



