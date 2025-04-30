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
