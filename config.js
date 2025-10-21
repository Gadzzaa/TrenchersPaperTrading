export const USE_LOCAL = true; // toggle manually here
let debugMode = true;

const CONFIG = {
  API_BASE_URL: USE_LOCAL
    ? "http://localhost:3000"
    : "https://trencherspapertrading.xyz",
  WS_URL: USE_LOCAL ? "ws://localhost:3000" : "wss://trencherspapertrading.xyz",
};

export function getDebugMode() {
  return debugMode;
}

export function setDebugMode(debug) {
  debugMode = debug;
}

export default CONFIG;
