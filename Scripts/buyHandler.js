import CONFIG from '../config.js';
export async function buyToken(tokenMint, solAmount, tokenPrice, slippage = 2, fee = 0.1) {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw new Error('No sessionToken found. Please log in again.');
  }

  const payload = {
    tokenMint,
    solAmount,
    tokenPrice,
    slippage,
    fee
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(CONFIG.API_BASE_URL + '/api/buy', {
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
          tokensReceived: result.tokensReceived,
          solSpent: result.solSpent,
          fees: result.fees
        };
      } else {
        throw new Error(result.error || 'Buy failed');
      }

    } catch (error) {
      if (attempt === 1) {
        console.error('❌ Buy failed after retry:', error);
        return null;
      }
      console.warn(`Retrying buyToken... (${attempt + 1})`);
    }
  }
}
