// connectionManager.js
import { healthCheck, checkSession } from "./API.js";
import { enableUI, disableUI } from "./utils.js";

let reconnectTimeout = null;
let reconnecting = false;

/**
 * Unified reconnection handler used by both popup and dashboard
 */
export async function handleReconnect(initCallback, context = "dashboard") {
  if (reconnecting) return;
  reconnecting = true;

  console.log(`[${context}] 🔁 Starting reconnect sequence...`);

  const healthy = await healthCheck();
  if (!healthy) {
    console.warn(`[${context}] No internet, disabling UI`);
    await disableUI("no-internet");
    scheduleReconnect(() => handleReconnect(initCallback, context));
    reconnecting = false;
    return;
  }

  const validSession = await checkSession();
  if (!validSession) {
    console.warn(`[${context}] Invalid session, showing login screen`);
    await disableUI("no-session");
    reconnecting = false;
    return;
  }

  // Everything OK
  console.log(
    `[${context}] ✅ Backend healthy, session valid — reinitializing`,
  );
  clearTimeout(reconnectTimeout);
  await enableUI();
  reconnecting = false;

  if (typeof initCallback === "function") {
    await initCallback();
  }
}

/**
 * Delay and retry reconnect later
 */
export function scheduleReconnect(callback, delay = 3000) {
  if (reconnectTimeout) return;
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    callback();
  }, delay);
}

/**
 * Cancels pending reconnect (e.g. on logout or shutdown)
 */
export function cancelReconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
}
