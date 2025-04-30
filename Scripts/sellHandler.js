import { getPortfolio } from './portofolioHandler.js';
import { showNotification } from './notificationSystem.js';
import { showSpinner, hideSpinner } from './spinner.js';
import { updateBalanceUI } from './dashboard.js';

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
