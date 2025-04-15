// Example to call login API from frontend
export async function login(username, password) {
  const response = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const user = await response.json();
    console.log('Login successful:', user);
  } else {
    console.error('Login failed:', response.statusText);
  }
}

// Example to call create account API from frontene
export async function createAccount(username, password) {
  const response = await fetch('http://localhost:3000/api/create-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    console.log('Account created successfully');
  } else {
    console.error('Failed to create account:', response.statusText);
  }
}
