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

document.addEventListener("DOMContentLoaded", () => {
  spinnerOverlay = document.getElementById("spinnerOverlay");
  spinnerText = document.getElementById("spinnerText");
  notificationPopup = document.getElementById("notificationPopup");
  notificationText = document.getElementById("notificationText");
  notificationInner = document.getElementById("notificationInner");
});

// Spinner.js
export function showSpinner() {
  if (!spinnerOverlay || !spinnerText) return;
  spinnerOverlay.style.opacity = "1";
  spinnerOverlay.style.pointerEvents = "auto";
  startSpinnerDots();
}

export function hideSpinner() {
  if (!spinnerOverlay || !spinnerText) return;
  spinnerOverlay.style.opacity = "0";
  spinnerOverlay.style.pointerEvents = "none";
  stopSpinnerDots();
}

function startSpinnerDots() {
  let dots = "";
  dotInterval = setInterval(() => {
    dots = dots.length < 3 ? dots + "." : "";
    spinnerText.textContent = `Processing${dots}`;
  }, 500);
}

function stopSpinnerDots() {
  clearInterval(dotInterval);
  spinnerText.textContent = "Processing...";
}

// NotificationSystem.js
/* export function showNotification(message, type) {
  console.log("Test notification, CHANGE THIS!!!! ");
  // Clear old animations first if any
  clearTimeout(slideOutTimeout);
  clearTimeout(popTimeout1);
  clearTimeout(popTimeout2);
  clearTimeout(glowTimeout1);
  clearTimeout(glowTimeout2);

  notificationText.textContent = message;

  notificationPopup.classList.remove(
    "successNotification",
    "errorNotification",
    "infoNotification",
  );
  notificationPopup.style.color = ""; // reset inline color if any

  const typeClasses = {
    success: "successNotification",
    error: "errorNotification",
    info: "infoNotification",
  };

  notificationPopup.classList.add(typeClasses[type] || "");

  notificationPopup.style.opacity = "0";
  notificationPopup.style.transform = "translateX(-50%) translateY(10px)";
  notificationInner.style.transform = "scale(1)";
  notificationInner.style.transition = "transform 0.4s ease";
  notificationText.style.animation = "";

  // Animate Slide Up
  setTimeout(() => {
    notificationPopup.style.opacity = "1";
    notificationPopup.style.transform = "translateX(-50%) translateY(-10px)";
  }, 10);

  // Animate Inner Scale Pop
  popTimeout1 = setTimeout(() => {
    notificationInner.style.transform = "scale(1.15)"; // pop bigger
    popTimeout2 = setTimeout(() => {
      notificationInner.style.transform = "scale(1)";
    }, 200); // pop back to normal after 200ms
  }, 100);

  // Animate Text Glow
  glowTimeout1 = setTimeout(() => {
    notificationText.style.animation = "textGlowPulse 0.8s ease forwards";

    glowTimeout2 = setTimeout(() => {
      notificationText.style.textShadow = "none";
    }, 800);
  }, 150);

  // Slide Out after 2 seconds
  slideOutTimeout = setTimeout(() => {
    notificationPopup.style.opacity = "0";
    notificationPopup.style.transform = "translateX(-50%) translateY(10px)";
  }, 3000);
}
*/
export function showNotification(message, type) {
  window.parent.postMessage(
    {
      type: "SHOW_NOTIFICATION",
      message: message,
    },
    "*",
  );
}

// Request from iframe.js
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
