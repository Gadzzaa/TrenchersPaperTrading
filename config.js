export const USE_LOCAL = false; // toggle manually here
let debugMode = false;

const CONFIG = {
  API_BASE_URL: USE_LOCAL
    ? "http://localhost:3000/api"
    : "https://trencherspapertrading.xyz",
  WS_URL: USE_LOCAL
    ? "ws://localhost:3000/ws"
    : "wss://trencherspapertrading.xyz",
};

export function getDebugMode() {
  return debugMode;
}

export function setDebugMode(debug) {
  debugMode = debug;
}

export default CONFIG;
