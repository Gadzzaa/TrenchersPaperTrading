//import { resetAccount } from "./API.js";
let tokenListContainer, indicator;
const barWidth = 30;
const tokens = [];

document.addEventListener("DOMContentLoaded", async () => {
  const footerButtons = document.querySelectorAll(".footerButton");
  indicator = document.querySelector(".indicator");
  tokenListContainer = document.getElementById("tokenList");

  // Footer Buttons animation
  footerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelector(".footerButton.active")
        ?.classList.remove("active");
      setDisplay(button);
      button.classList.add("active");
      moveIndicator(button);
    });
  });

  // Default active footer button
  const defaultButton = document.querySelector(".footerButton.active");
  moveIndicator(defaultButton);
  setDisplay(defaultButton);

  addToken("Solana", "SOL", 0.1);
  addToken("Solana", "SOL", 0.1);
  addToken("Solana", "SOL", 0.1);
  addToken("Solana", "SOL", 0.1);
  addToken("Solana", "SOL", 0.1);
});

function setDisplay(button) {
  document.querySelector(".menuItem.active")?.classList.remove("active");
  document.getElementById(button.dataset.menu).classList.add("active");
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
