// Constants
let spinnerOverlay;
let spinnerText;
let notificationPopup;
let notificationText;
let notificationInner;
const successSound = new Audio(chrome.runtime.getURL("Sounds/success.wav"));
const failSound = new Audio(chrome.runtime.getURL("Sounds/fail.wav"));
let audioVolume;

document.addEventListener("DOMContentLoaded", () => {
  spinnerOverlay = document.getElementById("spinnerOverlay");
  spinnerText = document.getElementById("spinnerText");
  notificationPopup = document.getElementById("notificationPopup");
  notificationText = document.getElementById("notificationText");
  chrome.storage.local.get("volume", ({ volume }) => {
    if (!volume) volume = 1.0;
    audioVolume = volume;
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.volume) {
      audioVolume = changes.volume.newValue;
    }
  });
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
export function showNotification(message, type, sound = true) {
  const typeClasses = {
    success: "✅",
    error: "❌",
    info: "ℹ",
  };

  const fullMessage = typeClasses[type] + " " + message;

  window.parent.postMessage(
    {
      type: "SHOW_NOTIFICATION",
      message: fullMessage,
    },
    "*",
  );

  if (sound)
    switch (type) {
      case "success":
        safePlay(type);
        break;
      case "error":
        safePlay(type);
        console.error(message);
        break;
      case "info":
        break; // No sound
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

  sound.volume = audioVolume.toFixed(2);
  sound.play().catch((e) => {
    console.error(`${type} sound failed:`, e);
  });
}

// Access blocker
export function enableUI() {
  const blocker = document.getElementById("Blocker");
  const loginPanel = document.getElementById("loginPanel");
  if (blocker) {
    blocker.style.opacity = "0";
    setTimeout(() => {
      const noInternetMessage = document.getElementById("noInternetMessage");
      const noSessionMessage = document.getElementById("noSessionMessage");
      if (noInternetMessage) noInternetMessage.style.display = "none";
      if (noSessionMessage) noSessionMessage.style.display = "none";

      blocker.style.display = "none";
    }, 300);
  }

  if (loginPanel) loginPanel.classList.add("loginHidden");
}

export function disableUI(reason) {
  const blocker = document.getElementById("Blocker");
  const loginPanel = document.getElementById("loginPanel");
  if (blocker) {
    blocker.style.display = "flex";
    const noInternetMessage = document.getElementById("noInternetMessage");
    const noSessionMessage = document.getElementById("noSessionMessage");
    switch (reason) {
      case "no-internet":
        if (noInternetMessage) noInternetMessage.style.display = "flex";
        break;
      case "no-session":
        if (noSessionMessage) noSessionMessage.style.display = "flex";
        break;
    }
    setTimeout(() => {
      blocker.style.opacity = "1";
    }, 300);
  }
  if (loginPanel) loginPanel.classList.remove("loginHidden");
}

export function internetConnection() {
  const noInternetMessage = document.getElementById("noInternetMessage");
  if (noInternetMessage) return noInternetMessage.style.display === "none";
}
export function startLoadingDots(button) {
  let dots = 0;
  button.dataset.originalText = button.textContent; // save original text
  document.body.style.pointerEvents = "none";

  const interval = setInterval(() => {
    dots = (dots + 1) % 4; // 0 → 1 → 2 → 3 → 0
    button.textContent = ".".repeat(dots);
  }, 250);

  return interval; // return interval ID so you can clear it later
}

export function stopLoadingDots(button, interval) {
  clearInterval(interval);
  button.textContent = button.dataset.originalText;
  document.body.style.pointerEvents = "auto";
}

// Requests from inject.js
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

export function requestHideApp() {
  window.parent.postMessage(
    {
      type: "HIDE_APP",
    },
    "*",
  );
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

export function removeFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.remove([key], () => resolve());
  });
}
