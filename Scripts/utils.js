// Constants
let spinnerOverlay;
let spinnerText;
let notificationPopup;
let notificationText;
let notificationInner;
const successSound = new Audio(chrome.runtime.getURL("Sounds/success.wav"));
const failSound = new Audio(chrome.runtime.getURL("Sounds/fail.wav"));
let audioVolume;
let hidePopupFn;

// Security: Sanitize text to prevent XSS
export function sanitizeText(text) {
  if (typeof text !== 'string') {
    text = String(text);
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Security: Validate numeric input
export function validateNumericInput(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error('Invalid numeric value');
  }
  if (num < min || num > max) {
    throw new Error(`Value must be between ${min} and ${max}`);
  }
  return num;
}

// Stability: Async error handler wrapper
export async function safeAsync(fn, fallback = null, errorMessage = 'Operation failed') {
  try {
    return await fn();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    if (fallback !== null) {
      return fallback;
    }
    throw error;
  }
}

// Stability: Cleanup manager for intervals and timeouts
const activeTimers = new Set();

export function managedSetInterval(callback, delay) {
  const id = setInterval(callback, delay);
  activeTimers.add({ type: 'interval', id });
  return id;
}

export function managedSetTimeout(callback, delay) {
  const id = setTimeout(() => {
    callback();
    activeTimers.delete(id);
  }, delay);
  activeTimers.add({ type: 'timeout', id });
  return id;
}

export function clearManagedInterval(id) {
  clearInterval(id);
  for (const timer of activeTimers) {
    if (timer.type === 'interval' && timer.id === id) {
      activeTimers.delete(timer);
      break;
    }
  }
}

export function clearManagedTimeout(id) {
  clearTimeout(id);
  for (const timer of activeTimers) {
    if (timer.type === 'timeout' && timer.id === id) {
      activeTimers.delete(timer);
      break;
    }
  }
}

export function clearAllTimers() {
  for (const timer of activeTimers) {
    if (timer.type === 'interval') {
      clearInterval(timer.id);
    } else if (timer.type === 'timeout') {
      clearTimeout(timer.id);
    }
  }
  activeTimers.clear();
}

// Stability: Simple rate limiter
const rateLimiters = new Map();

export function rateLimit(key, maxCalls = 5, windowMs = 1000) {
  const now = Date.now();
  
  if (!rateLimiters.has(key)) {
    rateLimiters.set(key, []);
  }
  
  const calls = rateLimiters.get(key);
  
  // Remove calls outside the window
  const validCalls = calls.filter(timestamp => now - timestamp < windowMs);
  
  if (validCalls.length >= maxCalls) {
    return false; // Rate limit exceeded
  }
  
  validCalls.push(now);
  rateLimiters.set(key, validCalls);
  
  return true; // Call allowed
}

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

  // Security: Sanitize message before displaying
  const sanitizedMessage = sanitizeText(message);
  const fullMessage = typeClasses[type] + " " + sanitizedMessage;

  window.parent.postMessage(
    {
      type: "SHOW_NOTIFICATION",
      message: fullMessage,
    },
    "https://axiom.trade",
  );

  if (sound)
    switch (type) {
      case "success":
        safePlay(type);
        break;
      case "error":
        safePlay(type);
        console.error(sanitizedMessage);
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
export async function enableUI() {
  const blocker = document.getElementById("Blocker");
  const popup = document.getElementById("popupTrenchersPT");
  if (blocker) {
    blocker.style.opacity = "0";
    setTimeout(() => {
      const noInternetMessage = document.getElementById("noInternetMessage");
      const noSessionMessage = document.getElementById("noSessionMessage");
      const updateReqMessage = document.getElementById("updateReqMessage");
      if (noInternetMessage) noInternetMessage.style.display = "none";
      if (noSessionMessage) noSessionMessage.style.display = "none";
      if (updateReqMessage) updateReqMessage.style.display = "none";

      blocker.style.display = "none";
    }, 300);
  }
  if (popup) {
    const loginPanel = document.getElementById("loginPanel");
    const noInternet = document.getElementById("noInternet");
    const updateReq = document.getElementById("updateReq");
    if (!noInternet?.classList.contains("hidden")) {
      noInternet.style.opacity = "0";
      setTimeout(() => {
        noInternet.classList.add("hidden");
      }, 300);
    }
    if (!updateReq?.classList.contains("hidden")) {
      updateReq.style.opacity = "0";
      setTimeout(() => {
        updateReq.classList.add("hidden");
      }, 300);
    }
    if (loginPanel) loginPanel.classList.add("loginHidden");
  }
}

export async function disableUI(reason) {
  const blocker = document.getElementById("Blocker");
  const popup = document.getElementById("popupTrenchersPT");
  if (blocker) {
    blocker.style.display = "flex";
    const noInternetMessage = document.getElementById("noInternetMessage");
    const noSessionMessage = document.getElementById("noSessionMessage");
    const updateReqMessage = document.getElementById("updateReqMessage");
    noInternetMessage.style.display = "none";
    noSessionMessage.style.display = "none";
    updateReqMessage.style.display = "none";
    switch (reason) {
      case "no-internet":
        if (noInternetMessage) noInternetMessage.style.display = "flex";
        break;
      case "no-session":
        if (noSessionMessage) noSessionMessage.style.display = "flex";
        break;
      case "outdated":
        if (updateReqMessage) updateReqMessage.style.display = "flex";
        break;
    }
    setTimeout(() => {
      blocker.style.opacity = "1";
    }, 300);
  }
  if (popup) {
    const loginPanel = document.getElementById("loginPanel");
    const noInternet = document.getElementById("noInternet");
    const updateReq = document.getElementById("updateReq");
    switch (reason) {
      case "no-internet":
        if (!updateReq?.classList.contains("hidden")) {
          updateReq.style.opacity = "0";
          setTimeout(() => {
            updateReq.classList.add("hidden");
          }, 300);
        }

        if (noInternet?.classList.contains("hidden")) {
          noInternet.style.opacity = "0";
          noInternet.classList.remove("hidden");
          noInternet.style.opacity = "1";
        }
        break;
      case "no-session":
        if (!noInternet?.classList.contains("hidden")) {
          noInternet.style.opacity = "0";
          setTimeout(() => {
            noInternet.classList.add("hidden");
          }, 300);
        }
        if (!updateReq?.classList.contains("hidden")) {
          updateReq.style.opacity = "0";
          setTimeout(() => {
            updateReq.classList.add("hidden");
          }, 300);
        }
        if (loginPanel) loginPanel.classList.remove("loginHidden");
        break;
      case "outdated":
        if (!noInternet?.classList.contains("hidden")) {
          noInternet.style.opacity = "0";
          setTimeout(() => {
            noInternet.classList.add("hidden");
          }, 300);
        }

        if (updateReq?.classList.contains("hidden")) {
          updateReq.style.opacity = "0";
          updateReq.classList.remove("hidden");
          updateReq.style.opacity = "1";
        }
        break;
    }
  }
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
  return new Promise((resolve, reject) => {
    const requestId = "get-contract-" + Date.now();
    let timeoutId = null;

    // Listen for response
    function handleMessage(event) {
      // Security: Verify origin is from axiom.trade (parent page)
      if (!event.origin.includes('axiom.trade') && event.origin !== window.location.origin) {
        return;
      }
      
      const { type, contract, requestId: responseId } = event.data;
      if (type === "CONTRACT_RESPONSE" && responseId === requestId) {
        window.removeEventListener("message", handleMessage);
        if (timeoutId) clearTimeout(timeoutId);
        resolve(contract);
      }
    }

    window.addEventListener("message", handleMessage);
    
    // Add timeout to prevent orphaned listeners
    timeoutId = setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      resolve(null); // Return null instead of rejecting to avoid breaking the flow
    }, 5000);

    // Send request to parent window (axiom.trade page)
    window.parent.postMessage(
      {
        type: "CONTRACT_REQUEST",
        requestId: requestId,
      },
      "https://axiom.trade",
    );
  });
}

export function requestHideApp() {
  window.parent.postMessage(
    {
      type: "HIDE_APP",
    },
    "https://axiom.trade",
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
