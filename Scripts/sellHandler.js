import { getPortfolio } from './portfolioHandler.js';
import { showNotification } from './notificationSystem.js';
import { showSpinner, hideSpinner } from './spinner.js';
import { updateBalanceUI } from './dashboard.js';
import CONFIG from '../config.js'; // Importing Config
const buttons = document.querySelectorAll('.sellButtons button');

export async function sellByPercentage(tokenMint, percentage, price) {
  try {
    showSpinner();
    buttons.forEach(btn => btn.disabled = true);

    const portfolio = await getPortfolio();
    if (!portfolio || !portfolio.tokens) {
      throw new Error('Portfolio data invalid.');
    }

    const totalAmount = portfolio.tokens[tokenMint];
    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
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
    buttons.forEach(btn => btn.disabled = false);
  }
}

async function sellToken(tokenMint, tokenAmount, tokenPrice, slippage = 2, fee = 0.1) {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw new Error('No sessionToken found. Please log in again.');
  }

  const payload = {
    tokenMint,
    tokenAmount,
    tokenPrice,
    slippage,
    fee
  }

  for (let attempt = 0; attempt < 2; attempt++) {

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(CONFIG.API_BASE_URL + '/api/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          solReceived: result.solReceived,
          tokensSold: result.tokensSold,
          fees: result.fees
        };
      } else {
        throw new Error(result.error || 'Sell failed');
      }

    } catch (error) {
      if (attempt === 1) {
        console.error('❌ Sell failed after retry:', error);
        return null;
      }
      if (attempt === 2) throw error;
      console.warn(`Retrying sellToken... (${attempt + 1})`);
    }
  }
}
