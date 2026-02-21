import { Variables } from "./Account/Core/Variables.js";
import { DataManager } from "./Account/Core/DataManager.js";
import { ServerValidation } from "./Server/ServerValidation.js";
import { SettingsManager } from "./Account/Core/SettingsManager.js";

import { getFromStorage } from "./utils.js";
import { disableUI, enableUI } from "./utils.js";

let variables;

let tokenListContainer,
  indicator,
  usernameText,
  accountUser,
  solBalance,
  accountId,
  accountResets,
  resetsWhenText,
  subscriptionType,
  subscriptionNextPayment,
  subscriptionPrice,
  subscriptionMethod,
  versionInfo,
  defaultButton,
  pnlData,
  usernameInput,
  nextPaymentText,
  passwordInput;
let isPremium = false;
let countdownResets = null;
let initializing = false;
let runtimeMessageListener = null;
const barWidth = 30;
const tokens = [];
async function init() {
  if (initializing) return;
  initializing = true;
  settings.forEach(({ key, default: def, apply }) => {
    chrome.storage.local.get(key, ({ [key]: value }) => {
      if (value === undefined) value = def;
      apply(value);
    });
  });

  let healthy = false;
  chrome.runtime.sendMessage({ type: "HEALTH_PING" }, async (response) => {
    healthy = response.status;
    if (healthy == null) return;
    if (healthy == false) {
      console.warn("Health check failed — retrying later.");
      await disableUI("no-internet");
      initializing = false;
      return;
    }
  });

  const validVersion = await ServerValidation.isLatestVersion();
  if (!validVersion) {
    console.warn("Outdated version detected.");
    await disableUI("outdated");
    initializing = false;
    return;
  }

  document.body.style.removeProperty("pointer-events");
  let sessionToken = await getFromStorage("sessionToken");
  if (!sessionToken) {
    await disableUI("no-session");
    console.warn("No session token found in storage.");
    initializing = false;
    return;
  }
  variables = new Variables({ sessionToken });
  let dataManager = new DataManager(variables);

  const isSessionValid = await dataManager.checkSession();
  if (!isSessionValid) {
    console.warn("Session invalid — showing login screen.");
    await disableUI("no-session");
    initializing = false;
    return;
  }

  await loadAPIData();

  await enableUI();

  initializing = false;
}

function disconnectPopup() {
  countdownResets = null;
}

document.addEventListener("DOMContentLoaded", async () => {
  usernameInput = document.getElementById("formUsername");
  usernameText = document.getElementById("usernameText");
  solBalance = document.getElementById("solBalance");
  pnlData = document.getElementById("pnlData");
  accountUser = document.getElementById("username");
  indicator = document.querySelector(".indicator");
  tokenListContainer = document.getElementById("tokenList");
  accountId = document.getElementById("id");
  accountResets = document.getElementById("resets");
  resetsWhenText = document.getElementById("resetsWhenText");
  subscriptionType = document.getElementById("subscriptionType");
  nextPaymentText = document.getElementById("nextPaymentText");
  subscriptionNextPayment = document.getElementById("subscriptionStatus");
  subscriptionPrice = document.getElementById("price");
  subscriptionMethod = document.getElementById("method");
  versionInfo = document.getElementById("versionInfo");

  // Disable arrow keys
  document.addEventListener("keydown", (e) => {
    const scrollKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  });

  // Default active footer button
  defaultButton = document.querySelector(".footerButton.active");
  moveIndicator(defaultButton);
  setDisplay(defaultButton.dataset.index);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.theme) {
      document.documentElement.setAttribute(
        "data-theme",
        changes.theme.newValue,
      );
    }
    if (area === "local" && changes.animation) {
      document.documentElement.style.setProperty(
        "--anim-time",
        `${changes.animation.newValue / 10}s`,
      );
      setQualityPreset(changes.animation.newValue);
    }
  });
  if (runtimeMessageListener) {
    chrome.runtime.onMessage.removeListener(runtimeMessageListener);
  }

  runtimeMessageListener = (message, sender, sendResponse) => {
    if (message.type === "STATUS_UPDATE") {
      console.log("Health status update received:", message.status);
      if (!message.status) {
        disconnectPopup();
        disableUI("no-internet");
      } else init();
    }
  };
  chrome.runtime.onMessage.addListener(runtimeMessageListener);

  await init();
});
async function loadAPIData() {
  let dataManager = new DataManager(variables);
  let settingsManager = new SettingsManager(variables);
  tokenListContainer.innerHTML = "";
  tokens.length = 0;
  const popupData = await dataManager.fetchAccountData();
  console.log("Popup data received:", popupData);
  const {
    userId,
    username,
    resets,
    portfolio,
    subscriptionInfo,
    version,
    realizedPNL,
  } = popupData;
  let subscription = subscriptionInfo.subscription;
  isPremium = subscriptionInfo?.premium == true;
  if (!userId) throw new Error("No user ID returned from API");
  if (!username) throw new Error("No username returned from API");
  if (resets == null) throw new Error("No resets count returned from API");
  if (usernameText.textContent != username) usernameText.textContent = username;
  solBalance.textContent = `${portfolio.solBalance.toFixed(2)} SOL`;
  localStorage.setItem("cachedSolBalance", portfolio.solBalance.toFixed(2));
  localStorage.setItem("cachedSolBalanceTime", Date.now().toString());
  pnlData.textContent = `${realizedPNL >= 0 ? "+" : ""}${realizedPNL.toFixed(2)} SOL / 24h`;

  for (const [poolAddress, token] of Object.entries(portfolio.tokens)) {
    if (token.amount <= 0) continue;
    addToken(poolAddress, token.name, token.symbol, token.amount, token.image);
  }

  if (accountUser.textContent != username) accountUser.textContent = username;
  accountId.textContent = userId;
  accountResets.textContent = resets.resetsNumber + " / 5";
  console.log("Last reset:", resets.lastReset);
  subscriptionType.textContent = capitalize(subscription.status);
  subscriptionNextPayment.textContent = "";
  if (subscription.currentPeriodEnd) {
    if (subscription.cancelAtPeriodEnd)
      nextPaymentText.textContent = "Expires: ";
    subscriptionNextPayment.textContent = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(subscription.currentPeriodEnd));
  }

  subscriptionPrice.textContent = `${subscription.currency}${parseFloat(subscription.price).toFixed(2)}`;
  subscriptionMethod.textContent = capitalize(subscription.paymentMethodType);
  versionInfo.textContent = version;

  //Settings
  try {
    const settings = await settingsManager.getSettings();
    applyPremiumSettings("saveWindowPos", settings.saveWindowPos, false);
    applyPremiumSettings(
      "pnlRefreshInterval",
      settings.pnlRefreshInterval,
      500,
    );

    console.log("Settings loaded:", settings);
  } catch (err) {
    console.warn("Using default settings due to error:", err);

    // Fallback to defaults if backend fails
    applyPremiumSettings("saveWindowPos", false);
    applyPremiumSettings("pnlRefreshInterval", 500);
  }

  startCountdown(resets.lastReset);
  applyPremiumUI(isPremium);
}
function capitalize(s) {
  return s && String(s[0]).toUpperCase() + String(s).slice(1);
}
function getTimeUntilNextReset(lastReset) {
  const last = new Date(lastReset);
  const next = new Date(last.getTime() + 24 * 60 * 60 * 1000); // +24h
  const now = new Date();
  let diffMs = next - now;
  if (diffMs < 0) diffMs = 0; // already passed

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}
function startCountdown(lastReset) {
  function update() {
    const { hours, minutes } = getTimeUntilNextReset(lastReset);
    resetsWhenText.textContent = `(next refill in ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m)`;
  }
  update(); // initial call
  countdownResets = setInterval(update, 1000 * 5); // update every 5s
}
function setDisplay(index) {
  const carousel = document.querySelector(".pageCarousel");
  const items = document.querySelectorAll(".menuItem");
  /*  document.querySelector(".menuItem.active")?.classList.remove("active");
  document.getElementById(button.dataset.menu).classList.add("active"); */
  const itemWidth = items[0].offsetWidth;
  const animTime = getComputedStyle(document.documentElement)
    .getPropertyValue("--anim-time")
    .trim();

  if (parseFloat(animTime) * 10 < 3)
    carousel.scrollTo({
      left: itemWidth * index,
      behavior: "instant",
    });
  else
    carousel.scrollTo({
      left: itemWidth * index,
      behavior: "smooth",
    });
}
function addToken(
  poolAddress,
  name,
  symbol,
  amount,
  imagePath = "Images/solana-sol-logo.png",
) {
  const token = {
    poolAddress,
    name,
    symbol,
    amount,
    imagePath,
  };
  tokens.push(token);
  renderToken(token);
}

function renderToken(token) {
  const button = document.createElement("button");
  button.classList.add("tkn");

  const safeName = token.name;
  const safeSymbol = token.symbol;
  const safeAmount = convertToKMB(token.amount);
  const safeImagePath = token.imagePath;

  button.innerHTML = `
    <div class="tknImage">
      <img src="${safeImagePath}" class="tknImageFile" onerror="this.src='Images/solana-sol-logo.png'" />
    </div>
    <div class="tknInfo">
      <p class="tknName" style="overflow: hidden">${safeName}</p>
      <p class="tknValue">${safeAmount} ${safeSymbol}</p>
    </div>
    <p class="tknClickTxt">Click to open</p>
  `;

  button.addEventListener("click", () => {
    // Security: Validate poolAddress before opening URL
    const poolAddressPattern = /^[a-zA-Z0-9]+$/;
    if (poolAddressPattern.test(token.poolAddress)) {
      window.open(
        `https://axiom.trade/meme/${encodeURIComponent(token.poolAddress)}`,
        "_blank",
      );
    } else {
      console.error("Invalid pool address:", token.poolAddress);
    }
  });

  if (!tokenListContainer) console.error("Token list container not found.");
  tokenListContainer.appendChild(button);
}

function clearInputFields() {
  if (usernameInput) usernameInput.value = "";
  if (passwordInput) passwordInput.value = "";
}

function moveIndicator(el) {
  const parentRect = el.parentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  const elCenter = elRect.left + elRect.width / 2;
  const parentLeft = parentRect.left;

  const barLeft = elCenter - parentLeft - barWidth / 2;

  if (!indicator) {
    console.error("Indicator not found.");
    return;
  }
  indicator.style.left = `${barLeft}px`;
}

export function showDialog({ title, message, type }) {
  return new Promise((resolve) => {
    const dialogOverlay = document.getElementById("dialogOverlay");
    const dialogHeader = document.getElementById("dialogHeader");
    const dialogBody = document.getElementById("dialogBody");
    const dialogInput = document.getElementById("dialogInput");
    const dialogButtons = document.getElementById("dialogButtons");
    const dialogInfo = document.getElementById("dialogInfo");
    const dialogLoading = document.getElementById("dialogLoading");

    // Reset and hide all conditional parts
    dialogInput.classList.add("hidden");
    dialogButtons.classList.add("hidden");

    // Set common text
    dialogHeader.textContent = title;
    dialogBody.textContent = message;

    // Show the dialog
    dialogOverlay.style.opacity = "0";
    dialogOverlay.classList.remove("hidden");
    setTimeout(() => {
      dialogOverlay.style.opacity = "1";
    }, 300);

    // Prevent inputs
    document.body.style.pointerEvents = "none";

    let baseCleanup = () => {
      setTimeout(() => {
        dialogOverlay.style.opacity = "0";
      }, 300); // slight delay to avoid flicker
      dialogOverlay.classList.add("hidden");
      dialogHeader.textContent = "";
      dialogBody.textContent = "";
      document.body.style.removeProperty("pointer-events");
    };

    let cleanup;
    switch (type) {
      case "Input":
        dialogInput.classList.remove("hidden");
        const inputField = document.getElementById("dialogTextInput");
        const inputConfirmButton =
          document.getElementById("inputConfirmButton");

        cleanup = () => {
          dialogInput.classList.add("hidden");
          inputConfirmButton.removeEventListener("click", onInputConfirm);
          inputField.value = "";
        };

        var onInputConfirm = () => {
          baseCleanup();
          resolve(inputField.value);
          cleanup();
        };
        inputConfirmButton.addEventListener("click", onInputConfirm);
        break;
      case "Confirm":
        dialogButtons.classList.remove("hidden");
        const confirmButton = document.getElementById("dialogConfirmButton");
        const cancelButton = document.getElementById("dialogCancelButton");

        cleanup = () => {
          dialogButtons.classList.add("hidden");
          confirmButton.removeEventListener("click", onConfirm);
          cancelButton.removeEventListener("click", onCancel);
        };
        var onConfirm = () => {
          baseCleanup();
          cleanup();
          resolve(true);
        };
        var onCancel = () => {
          baseCleanup();
          cleanup();
          resolve(false);
        };

        confirmButton.addEventListener("click", onConfirm);
        cancelButton.addEventListener("click", onCancel);
        break;
      case "Info":
        dialogInfo.classList.remove("hidden");
        const okayButton = document.getElementById("dialogInfoButton");

        cleanup = () => {
          dialogInfo.classList.add("hidden");
          okayButton.removeEventListener("click", onConfirm);
        };

        var onConfirm = () => {
          baseCleanup();
          cleanup();
        };

        okayButton.addEventListener("click", onConfirm);
        break;
    }
  });
}

function applyPremiumUI(isPremium) {
  const saveWindowBox = document.getElementById("saveWindowBox");
  const pnlSlider = document.getElementById("pnlSlider");

  if (!isPremium) {
    saveWindowBox.checked = false;
    saveWindowBox.disabled = true;
    pnlSlider.disabled = true;

    saveWindowBox.title = "Premium feature";
    pnlSlider.title = "Premium feature";
  } else {
    saveWindowBox.disabled = false;
    pnlSlider.disabled = false;
  }
}

function applyPremiumSettings(key, value, fallback) {
  if (value === undefined || value === null) {
    value = fallback;
  }

  switch (key) {
    case "saveWindowPos":
      value = Boolean(value);
      const checkbox = document.getElementById("saveWindowBox");
      if (checkbox) checkbox.checked = value;
      break;

    case "pnlRefreshInterval":
      value = Number(value);
      if (isNaN(value)) value = fallback;
      const slider = document.getElementById("pnlSlider");
      if (slider) slider.value = value / 100;
      break;
  }
}

function hideSubscriptionDiv() {
  const subDiv = document.getElementById("SubscriptionSelectorDiv");
  subDiv.style.opacity = "0";
  subDiv.classList.add("hidden");
}

function convertToKMB(num) {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + "B";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  } else {
    return num.toFixed(2);
  }
}
