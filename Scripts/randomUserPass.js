export function generateRandomUsername() {
  const adjectives = ["cool", "fast", "silent", "wild", "smart", "crazy", "fuzzy"];
  const nouns = ["tiger", "ninja", "rider", "robot", "wizard", "pirate", "panda"];
  const number = Math.floor(Math.random() * 1000);

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}${noun}${number}`;
}

export function generateRandomPassword(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}