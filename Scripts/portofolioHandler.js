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
