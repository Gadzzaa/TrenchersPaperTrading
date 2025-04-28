export async function buyToken(tokenMint, solAmount, slippage = 2, fee = 0.1) {
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
