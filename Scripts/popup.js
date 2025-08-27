import {
  resetAccount,
  login,
  register,
  checkSession,
  fetchPopupData,
} from "./API.js";
import { getDebugMode, setDebugMode } from "../config.js";
let tokenListContainer,
  indicator,
  usernameText,
  accountUser,
  solBalance,
  accountId,
  accountResets,
  subscriptionType,
  subscriptionNextPayment,
  subscriptionPrice,
  subscriptionMethod;
const barWidth = 30;
const tokens = [];

async function init() {
  const loginPanel = document.getElementById("loginPanel");

  chrome.storage.local.get("theme", ({ theme }) => {
    if (!theme) theme = "dark";
    const button = document.getElementById(theme + "Theme");
    button.classList.add("active");
    document.documentElement.setAttribute("data-theme", theme);
  });

  chrome.storage.local.get("volume", ({ volume }) => {
    if (!volume) volume = 1.0;
    const volumeSlider = document.getElementById("volumeSlider");
    volumeSlider.value = volume * 100;
  });

  chrome.storage.local.get("animation", ({ animation }) => {
    if (!animation) animation = 3;
    const animationSlider = document.getElementById("animationSlider");
    animationSlider.value = animation;
    document.documentElement.style.setProperty(
      "--anim-time",
      `${animation / 10}s`,
    );
  });

  chrome.storage.local.get("saveWindowPos", ({ saveWindowPos }) => {
    if (!saveWindowPos) saveWindowPos = false;
    const saveWindowBox = document.getElementById("saveWindowBox");
    saveWindowBox.checked = saveWindowPos;
  });

  chrome.storage.local.get("pnlSlider", ({ pnlSlider }) => {
    if (!pnlSlider) pnlSlider = 500;
    const pnlSliderEl = document.getElementById("pnlSlider");
    pnlSliderEl.value = pnlSlider / 100;
  });

  chrome.storage.local.get("debugMode", ({ debugMode }) => {
    if (!debugMode) debugMode = false;
    const debugButton = document.getElementById("debugButton");
    switch (debugMode) {
      case true:
        debugButton.classList.add("active");
        setDebugMode(true);
        break;
      case false:
        debugButton.classList.remove("active");
        setDebugMode(false);
        break;
    }
  });
  const validSession = await checkSession();
  if (!validSession) {
    loginPanel.classList.remove("hideLoginPanel");
    return;
  }
  loginPanel.classList.add("hideLoginPanel");
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
  subscriptionType = document.getElementById("subscriptionType");
  subscriptionNextPayment = document.getElementById("subscriptionStatus");
  subscriptionPrice = document.getElementById("price");
  subscriptionMethod = document.getElementById("method");

  await init();

  chrome.storage.local.get(["username"], (res) => {
    usernameText.textContent = res.username || "Guest";
    accountUser.textContent = res.username || "Guest";
  });

  document.getElementById("loginButton").addEventListener("click", async () => {
    login(usernameInput.value, passwordInput.value)
      .then(async () => {
        await loadAPIData();
      })
      .catch((err) => {
        console.error("Login failed:", err);
      });
  });

  document
    .getElementById("registerButton")
    .addEventListener("click", async () => {
      register(usernameInput.value, passwordInput.value)
        .then(async () => {
          await loadAPIData();
        })
        .catch((err) => {
          console.error("Registration failed:", err);
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

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.theme) {
      document.documentElement.setAttribute(
        "data-theme",
        changes.theme.newValue,
      );
    }
  });

  volumeSlider.addEventListener("input", function () {
    chrome.storage.local.set({ volume: parseFloat(this.value) / 100 });
  });

  animationSlider.addEventListener("input", function () {
    chrome.storage.local.set({ animation: this.value });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.animation) {
      document.documentElement.style.setProperty(
        "--anim-time",
        `${changes.animation.newValue / 10}s`,
      );
    }
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
  const defaultButton = document.querySelector(".footerButton.active");
  moveIndicator(defaultButton);
  setDisplay(defaultButton.dataset.index);
});

async function loadAPIData() {
  const popupData = await fetchPopupData();
  const { userId, username, resets, portfolio, subscription } = popupData;
  if (!userId) throw new Error("No user ID returned from API");
  if (!username) throw new Error("No username returned from API");
  if (resets == null) throw new Error("No resets count returned from API");
  if (usernameText.textContent != username) usernameText.textContent = username;
  solBalance.textContent = `${portfolio.solBalance.toFixed(2)} SOL`;
  localStorage.setItem("cachedSolBalance", portfolio.solBalance.toFixed(2));
  localStorage.setItem("cachedSolBalanceTime", Date.now().toString());
  // TODO: Calculate total PNL
  for (const [mint] of Object.entries(portfolio.tokens)) {
    addToken(mint, mint.name, mint.symbol, mint.amount, mint.image);
  }
  if (accountUser.textContent != username) accountUser.textContent = username;
  accountId.textContent = userId;
  accountResets.textContent = resets + " / 5";
  subscriptionType.textContent = subscription.status;
  subscriptionNextPayment.textContent = subscription.expiresAt;
  subscriptionPrice.textContent = `${subscription.currency} ${subscription.price}`;
  subsciptionMethod.textContent = subscription.paymentMethodType;
}
function setDisplay(index) {
  const carousel = document.querySelector(".pageCarousel");
  const items = document.querySelectorAll(".menuItem");
  /*  document.querySelector(".menuItem.active")?.classList.remove("active");
  document.getElementById(button.dataset.menu).classList.add("active"); */
  const itemWidth = items[0].offsetWidth;
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

  if (!indicator) console.error("Indicator not found.");
  indicator.style.left = `${barLeft}px`;
}
