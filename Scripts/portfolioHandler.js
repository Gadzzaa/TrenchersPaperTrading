import CONFIG from '../config.js';
let cachedPortfolio = null;
let lastFetchedTime = 0;
const CACHE_DURATION_MS = 1000; // 1 second cache
export async function getPortfolio() {
  const now = Date.now();
  if (cachedPortfolio && (now - lastFetchedTime < CACHE_DURATION_MS)) {
    return cachedPortfolio;
  }
  const username = localStorage.getItem('loggedInUsername');
  const sessionToken = localStorage.getItem('sessionToken');
  if (!username) {
    throw new Error('No loggedInUsername found in localStorage');
  }
  if (!sessionToken) {
    throw new Error('No sessionToken found. Please log in again.');
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(CONFIG.API_BASE_URL + `/api/portfolio/${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Portfolio fetched:', data);

      cachedPortfolio = data;
      lastFetchedTime = now;

      return data; // 🛠 Return the WHOLE portfolio object!

    } catch (error) {
      if (attempt === 1) {
        console.error('❌ Error fetching portfolio:', error);
        return null;
      }
      console.warn(`Retrying getPortfolio... (${attempt + 1})`);
    }
  }
}
