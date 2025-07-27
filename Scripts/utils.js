// Constants
let spinnerOverlay;
let spinnerText;
let notificationPopup;
let notificationText;
let notificationInner;
let dotInterval;
let slideOutTimeout;
let popTimeout1;
let popTimeout2;
let glowTimeout1;
let glowTimeout2;
let lastPlay = 0;
const successSound = new Audio(chrome.runtime.getURL("Sounds/success.wav"));
const failSound = new Audio(chrome.runtime.getURL("Sounds/fail.wav"));
successSound.volume = 0.4;
failSound.volume = 0.4;

document.addEventListener("DOMContentLoaded", () => {
  spinnerOverlay = document.getElementById("spinnerOverlay");
  spinnerText = document.getElementById("spinnerText");
  notificationPopup = document.getElementById("notificationPopup");
  notificationText = document.getElementById("notificationText");
  notificationInner = document.getElementById("notificationInner");
});

export function disableAllTradeButtons(allButtons) {
  allButtons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.add("hidden");
  });
}

export function enableAllTradeButtons(allButtons) {
  allButtons.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("hidden");
    const originalText = btn.getAttribute("data-original-label");
    if (originalText) btn.innerHTML = originalText;
  });
}

export function showButtonLoading(button) {
  const original = button.innerHTML;
  button.setAttribute("data-original-label", original);

  button.innerHTML = `
    <div class="loading-dots">
      <span></span><span></span><span></span>
    </div>
  `;
}

// NotificationSystem.js
export function showNotification(message, type) {
  const typeClasses = {
    success: "✅",
    error: "❌",
    info: "ℹ",
  };
  window.parent.postMessage(
    {
      type: "SHOW_NOTIFICATION",
      message: typeClasses[type] + " " + message,
    },
    "*",
  );
  switch (type) {
    case "success":
      safePlay(successSound);
      break;
    case "error":
      safePlay(failSound);
      break;
    case "info":
      // No sound for info
      break;
  }
}

function safePlay(audio) {
  const now = Date.now();
  //  if (now - lastPlay > 50) {
  lastPlay = now;
  audio.play().catch((e) => {
    throw new Error(`${type} sound failed:`, e);
  });
  // }
}

// Requests from inject.js
export function requestSymbol() {
  return new Promise((resolve) => {
    const requestId = "get-symbol-" + Date.now();

    // Listen for response
    function handleMessage(event) {
      const { type, symbol, requestId: responseId } = event.data;
      if (type === "SYMBOL_RESPONSE" && responseId === requestId) {
        window.removeEventListener("message", handleMessage);
        resolve(symbol);
      }
    }

    window.addEventListener("message", handleMessage);

    // Send request
    window.parent.postMessage(
      {
        type: "SYMBOL_REQUEST",
        requestId: requestId,
      },
      "*",
    );
  });
}

export function requestPrice() {
  return new Promise((resolve) => {
    const requestId = "get-price-" + Date.now();

    // Listen for response
    function handleMessage(event) {
      const { type, price, requestId: responseId } = event.data;
      if (type === "PRICE_RESPONSE" && responseId === requestId) {
        window.removeEventListener("message", handleMessage);
        resolve(price);
      }
    }

    window.addEventListener("message", handleMessage);

    // Send request
    window.parent.postMessage(
      {
        type: "PRICE_REQUEST",
        requestId: requestId,
      },
      "*",
    );
  });
}

export function requestCurrentContract() {
  return new Promise((resolve) => {
    const requestId = "get-contract-" + Date.now();

    // Listen for response
    function handleMessage(event) {
      const { type, contract, requestId: responseId } = event.data;
      if (type === "CONTRACT_RESPONSE" && responseId === requestId) {
        window.removeEventListener("message", handleMessage);
        resolve(contract);
      }
    }

    window.addEventListener("message", handleMessage);

    // Send request
    window.parent.postMessage(
      {
        type: "CONTRACT_REQUEST",
        requestId: requestId,
      },
      "*",
    );
  });
}
