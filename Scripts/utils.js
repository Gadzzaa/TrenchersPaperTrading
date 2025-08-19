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
const successSound = new Audio(chrome.runtime.getURL("Sounds/success.wav"));
const failSound = new Audio(chrome.runtime.getURL("Sounds/fail.wav"));
let audioVolume;

document.addEventListener("DOMContentLoaded", () => {
  spinnerOverlay = document.getElementById("spinnerOverlay");
  spinnerText = document.getElementById("spinnerText");
  notificationPopup = document.getElementById("notificationPopup");
  notificationText = document.getElementById("notificationText");
  notificationInner = document.getElementById("notificationInner");
  chrome.storage.local.get("volume", ({ volume }) => {
    if (volume) {
      audioVolume = volume;
    } else {
      audioVolume = 1.0;
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.volume) {
      audioVolume = changes.volume.newValue;
    }
  });
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
      safePlay(type);
      break;
    case "error":
      safePlay(type);
      console.error(message);
      break;
    case "info":
      // No sound for info
      break;
  }
}

function safePlay(type) {
  let sound;
  switch (type) {
    case "success":
      sound = new Audio(successSound.src);
      break;
    case "error":
      sound = new Audio(failSound.src);
      break;
    default:
      return;
  }

  sound.volume = audioVolume;
  sound.play().catch((e) => {
    console.error(`${type} sound failed:`, e);
  });
}

// Access blocker
export function enableUI() {
  const blocker = document.getElementById("loginBlocker");
  if (blocker) blocker.style.display = "none";
}

export function disableUI() {
  const blocker = document.getElementById("loginBlocker");
  if (blocker) blocker.style.display = "flex";
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

export function getFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (res) => resolve(res[key]));
  });
}

export function setToStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}
