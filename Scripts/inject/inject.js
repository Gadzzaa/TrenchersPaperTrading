import { InjectUtils } from "./InjectUtils.js";
import { RouteHelper } from "./RouteHelper.js";
// 🚀 Start the app

let routeHelper;

(async () => {
  try {
    await waitForBody(); // wait for body to exist
    await onPageReady(); // wait for DOM ready

    await new Promise((r) => setTimeout(r, 500));
    InjectUtils.injectStylesheet();

    // Now safe to start monitoring routes
    routeHelper = new RouteHelper();
    InjectUtils.injectToggleButton(routeHelper);
    routeHelper.monitorRouteChanges();
  } catch (err) {
    console.error("❌ Failed to initialize TrenchersPaperTrading:", err);
  }
})();

function waitForBody() {
  return new Promise((resolve) => {
    if (document.body) return resolve();
    const observer = new MutationObserver((mutations, obs) => {
      if (document.body) {
        obs.disconnect();
        resolve();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function onPageReady() {
  return new Promise((resolve) => {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      return resolve();
    }
    window.addEventListener("DOMContentLoaded", resolve, { once: true });
  });
}

window.addEventListener("message", async (event) => {
  // Security: Accept messages from extension iframes and same origin
  const isExtensionOrigin = event.origin.startsWith("chrome-extension://");
  const isSameOrigin = event.origin === window.location.origin;

  if (!isExtensionOrigin && !isSameOrigin) {
    return;
  }

  const { type, requestId } = event.data;

  if (type === "CONTRACT_REQUEST" && requestId) {
    const contract = RouteHelper.getURLSegmentAfter("meme");
    event.source.postMessage(
      {
        type: "CONTRACT_RESPONSE",
        contract,
        requestId,
      },
      event.origin,
    );
  }
  if (type === "SHOW_NOTIFICATION" && event.data?.message) {
    InjectUtils.showNotification(event.data.message);
  }

  if (type === "HIDE_APP") {
    routeHelper?.handleHideApp();
  }
});
