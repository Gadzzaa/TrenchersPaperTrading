import {
  resetAccount,
  login,
  register,
  logout,
  checkSession,
  fetchPopupData,
} from "./API.js";
import { getDebugMode, setDebugMode } from "../config.js";
import {
  disableUI,
  enableUI,
  startLoadingDots,
  stopLoadingDots,
} from "./utils.js";
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
  defaultButton;
const barWidth = 30;
const tokens = [];
const settings = [
  {
    key: "username",
    default: "Guest",
    apply: (value) => {
      usernameText.textContent = value;
      accountUser.textContent = value;
    },
  },
  {
    key: "theme",
    default: "dark",
    apply: (value) => {
      const button = document.getElementById(value + "Theme");
      button?.classList.add("active");
      document.documentElement.setAttribute("data-theme", value);
    },
  },
  {
    key: "volume",
    default: 1.0,
    apply: (value) => {
      const slider = document.getElementById("volumeSlider");
      if (slider) slider.value = value * 100;
    },
  },
  {
    key: "animation",
    default: 3,
    apply: (value) => {
      const slider = document.getElementById("animationSlider");
      if (slider) slider.value = value;
      document.documentElement.style.setProperty(
        "--anim-time",
        `${value / 10}s`,
      );
      setQualityPreset(value);
    },
  },
  {
    key: "saveWindowPos",
    default: false,
    apply: (value) => {
      const checkbox = document.getElementById("saveWindowBox");
      if (checkbox) checkbox.checked = value;
    },
  },
  {
    key: "pnlSlider",
    default: 500,
    apply: (value) => {
      const slider = document.getElementById("pnlSlider");
      if (slider) slider.value = value / 100;
    },
  },
  {
    key: "debugMode",
    default: false,
    apply: (value) => {
      const button = document.getElementById("debugButton");
      if (!button) return;
      button.classList.toggle("active", value);
      setDebugMode(value);
    },
  },
];

async function init() {
  const loginPanel = document.getElementById("loginPanel");
  settings.forEach(({ key, default: def, apply }) => {
    chrome.storage.local.get(key, ({ [key]: value }) => {
      if (value === undefined) value = def;
      apply(value);
    });
  });
  const validSession = await checkSession();
  if (!validSession) {
    disableUI();
    return;
  }
  enableUI();
  await loadAPIData();
}

document.addEventListener("DOMContentLoaded", async () => {
  const footerButtons = document.querySelectorAll(".footerButton");
  const debugButton = document.getElementById("debugButton");
  const usernameInput = document.getElementById("formUsername");
  const passwordInput = document.getElementById("formPassword");
  const showPasswordButton = document.getElementById("showPasswordButton");
  const icon = showPasswordButton.querySelector("i");
  usernameText = document.getElementById("usernameText");
  solBalance = document.getElementById("solBalance");
  accountUser = document.getElementById("username");
  const themeButtons = document.querySelectorAll(".theme");
  const volumeSlider = document.getElementById("volumeSlider");
  const animationSlider = document.getElementById("animationSlider");
  const saveWindowBox = document.getElementById("saveWindowBox");
  const pnlSlider = document.getElementById("pnlSlider");
  indicator = document.querySelector(".indicator");
  tokenListContainer = document.getElementById("tokenList");
  accountId = document.getElementById("id");
  accountResets = document.getElementById("resets");
  resetsWhenText = document.getElementById("resetsWhenText");
  subscriptionType = document.getElementById("subscriptionType");
  subscriptionNextPayment = document.getElementById("subscriptionStatus");
  subscriptionPrice = document.getElementById("price");
  subscriptionMethod = document.getElementById("method");
  versionInfo = document.getElementById("versionInfo");
  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");
  const logoutButton = document.getElementById("logoutButton");

  await init();

  loginButton.addEventListener("click", async () => {
    const interval = startLoadingDots(loginButton);

    await login(usernameInput.value, passwordInput.value)
      .then(async () => {
        await loadAPIData();
        moveIndicator(defaultButton);
        setDisplay(defaultButton.dataset.index);
      })
      .catch((err) => {
        console.error("Login failed:", err);
      })
      .finally(() => {
        stopLoadingDots(loginButton, interval);
      });
  });

  registerButton.addEventListener("click", async () => {
    const interval = startLoadingDots(registerButton);
    await register(usernameInput.value, passwordInput.value, 50)
      .then(async () => {
        await loadAPIData();
        moveIndicator(defaultButton);
        setDisplay(defaultButton.dataset.index);
      })
      .catch((err) => {
        console.error("Registration failed:", err);
      })
      .finally(() => {
        stopLoadingDots(registerButton, interval);
      });
  });
  logoutButton.addEventListener("click", async () => {
    const interval = startLoadingDots(logoutButton);
    await logout()
      .then(() => {
        moveIndicator(defaultButton);
        setDisplay(defaultButton.dataset.index);
      })
      .catch((err) => {
        console.error("Logout failed:", err);
      })
      .finally(() => {
        stopLoadingDots(logoutButton, interval);
      });
  });

  showPasswordButton.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  });

  // Disable arrow keys
  document.addEventListener("keydown", (e) => {
    const scrollKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  });

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      themeButtons.forEach((btn) => btn.classList.remove("active"));
      switch (button.id) {
        case "lightTheme":
          chrome.storage.local.set({ theme: "light" });
          button.classList.add("active");
          break;
        case "darkTheme":
          chrome.storage.local.set({ theme: "dark" });
          button.classList.add("active");
          break;
      }
    });
  });
  volumeSlider.addEventListener("input", function () {
    chrome.storage.local.set({ volume: parseFloat(this.value) / 100 });
  });

  animationSlider.addEventListener("input", function () {
    chrome.storage.local.set({ animation: this.value });
  });

  saveWindowBox.addEventListener("change", (e) => {
    chrome.storage.local.set({ saveWindowPos: e.target.checked });
  });

  pnlSlider.addEventListener("input", function () {
    chrome.storage.local.set({ pnlSlider: this.value * 100 });
  });

  debugButton.addEventListener("click", () => {
    if (debugButton.classList.contains("active")) {
      debugButton.classList.remove("active");
      setDebugMode(false);
      chrome.storage.local.set({ debugMode: false });
    } else {
      debugButton.classList.add("active");
      setDebugMode(true);
      chrome.storage.local.set({ debugMode: true });
    }
  });

  // Footer Buttons animation
  footerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = parseInt(button.dataset.index, 10);
      document
        .querySelector(".footerButton.active")
        ?.classList.remove("active");
      button.classList.add("active");
      setDisplay(index);
      moveIndicator(button);
    });
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
});

async function loadAPIData() {
  tokenListContainer.innerHTML = "";
  tokens.length = 0;
  const popupData = await fetchPopupData();
  const { userId, username, resets, portfolio, subscriptionInfo, version } =
    popupData;
  console.log("Popup Data:", popupData);
  let subscription = subscriptionInfo.subscription;
  if (!userId) throw new Error("No user ID returned from API");
  if (!username) throw new Error("No username returned from API");
  if (resets == null) throw new Error("No resets count returned from API");
  if (usernameText.textContent != username) usernameText.textContent = username;
  solBalance.textContent = `${portfolio.solBalance.toFixed(2)} SOL`;
  localStorage.setItem("cachedSolBalance", portfolio.solBalance.toFixed(2));
  localStorage.setItem("cachedSolBalanceTime", Date.now().toString());
  // TODO: Calculate total PNL

  for (const [mint, token] of Object.entries(portfolio.tokens)) {
    addToken(mint, token.name, token.symbol, token.amount, token.image);
  }

  if (accountUser.textContent != username) accountUser.textContent = username;
  accountId.textContent = userId;
  accountResets.textContent = resets.resetsNumber + " / 5";
  console.log("Last reset:", resets.lastReset);
  subscriptionType.textContent = subscription.status;
  subscriptionNextPayment.textContent = subscription.expiresAt;
  subscriptionPrice.textContent = `${subscription.currency}${parseFloat(subscription.price).toFixed(2)}`;
  subscriptionMethod.textContent = subscription.paymentMethodType;
  versionInfo.textContent = version;
  startCountdown(resets.lastReset);
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
  setInterval(update, 1000 * 30); // update every minute
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
  mint,
  name,
  symbol,
  amount,
  imagePath = "Images/solana-sol-logo.png",
) {
  const token = {
    mint,
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

  button.innerHTML = `
    <div class="tknImage">
      <img src="${token.imagePath}" class="tknImageFile" />
    </div>
    <div class="tknInfo">
      <p class="tknName">${token.name}</p>
      <p class="tknValue">${token.amount} ${token.symbol}</p>
    </div>
    <p class="tknClickTxt">Click to open</p>
  `;

  button.addEventListener("click", () => {
    window.open(`https://axiom.trade/meme/${token.mint}`, "_blank");
  });

  if (!tokenListContainer) console.error("Token list container not found.");
  tokenListContainer.appendChild(button);
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

function setQualityPreset(qualityValue) {
  document.querySelector(".pageCarousel").style.scrollBehavior =
    qualityValue < 3 ? "auto" : "smooth";
  const buttons = document.querySelectorAll("button");
  if (qualityValue < 2) {
    buttons.forEach((btn) => btn.style.removeProperty("will-change"));
  } else {
    buttons.forEach(
      (btn) =>
        (btn.style.willChange =
          "transform, background-color, color, box-shadow, border-color"),
    );
  }
  if (qualityValue < 1) {
    buttons.forEach((btn) => btn.classList.add("no-shadow"));
  } else {
    buttons.forEach((btn) => btn.classList.remove("no-shadow"));
  }
}
