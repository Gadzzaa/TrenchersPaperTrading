import { resetAccount, login, register } from "./API.js";
let tokenListContainer, indicator;
const barWidth = 30;
const tokens = [];

document.addEventListener("DOMContentLoaded", async () => {
  const footerButtons = document.querySelectorAll(".footerButton");
  const debugButton = document.getElementById("debugButton");
  const usernameInput = document.getElementById("formUsername");
  const passwordInput = document.getElementById("formPassword");
  const showPasswordButton = document.getElementById("showPasswordButton");
  const icon = showPasswordButton.querySelector("i");
  const usernameText = document.getElementById("usernameText");
  indicator = document.querySelector(".indicator");
  tokenListContainer = document.getElementById("tokenList");

  document.getElementById("loginButton").addEventListener("click", async () => {
    login(usernameInput.value, passwordInput.value);
  });

  document
    .getElementById("registerButton")
    .addEventListener("click", async () => {
      register(usernameInput.value, passwordInput.value);
    });

  chrome.storage.local.get(["username"], (res) => {
    usernameText.textContent = res.username || "Guest";
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

  debugButton.addEventListener("click", () => {
    if (debugButton.classList.contains("active"))
      debugButton.classList.remove("active");
    else debugButton.classList.add("active");
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

  addToken("Solana", "SOL", 0.1);
  addToken("Solana", "SOL", 0.1);
  addToken("Solana", "SOL", 0.1);
  addToken("Solana", "SOL", 0.1);
  addToken("Solana", "SOL", 0.1);
});

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
  name,
  symbol,
  amount,
  imagePath = "Images/solana-sol-logo.png",
) {
  const token = {
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

  /* click handler
    button.addEventListener("click", () => {
    console.log(`Clicked ${token.name}`);
  }); */

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
