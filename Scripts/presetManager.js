let defaultPresets = {
  preset1: {
    buys: {
      buy1: { amount: "0.1", symbol: "SOL" },
      buy2: { amount: "0.25", symbol: "SOL" },
      buy3: { amount: "0.5", symbol: "SOL" },
      buy4: { amount: "1", symbol: "SOL" },
    },
    sells: {
      sell1: { amount: "10", symbol: "%" },
      sell2: { amount: "25", symbol: "%" },
      sell3: { amount: "50", symbol: "%" },
      sell4: { amount: "100", symbol: "%" },
    },
  },
  preset2: {
    buys: {
      buy1: { amount: "0.25", symbol: "SOL" },
      buy2: { amount: "0.5", symbol: "SOL" },
      buy3: { amount: "0.75", symbol: "SOL" },
      buy4: { amount: "1", symbol: "SOL" },
    },
    sells: {
      sell1: { amount: "10", symbol: "%" },
      sell2: { amount: "25", symbol: "%" },
      sell3: { amount: "50", symbol: "%" },
      sell4: { amount: "100", symbol: "%" },
    },
  },
  preset3: {
    buys: {
      buy1: { amount: "0.5", symbol: "SOL" },
      buy2: { amount: "0.75", symbol: "SOL" },
      buy3: { amount: "1", symbol: "SOL" },
      buy4: { amount: "1.25", symbol: "SOL" },
    },
    sells: {
      sell1: { amount: "10", symbol: "%" },
      sell2: { amount: "25", symbol: "%" },
      sell3: { amount: "50", symbol: "%" },
      sell4: { amount: "100", symbol: "%" },
    },
  },
};

import { showNotification } from "./utils.js";
import { getDebugMode } from "../config.js";

document.addEventListener("DOMContentLoaded", () => {
  try {
    const presetButtons = document.querySelectorAll("#Presets .preset");
    if (!presetButtons) throw new Error("Preset buttons not found");
    presetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        applyPreset(button.id);
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : string(error);
    showNotification(
      getDebugMode() ? "[pnlHandler.js] " + message : message,
      "error",
    );
  }
});

function loadDefault() {
  setPresets(defaultPresets);
}

export function getPresets() {
  return localStorage.getItem("presets");
}

export function setPresets(newPresets) {
  localStorage.setItem("presets", JSON.stringify(newPresets));
  localStorage.setItem("pendingPresets", true);
}

export function getUsingPreset() {
  return localStorage.getItem("usingPreset");
}

export function applyPreset(presetName) {
  const oldPresetUI = document.querySelector(".activePreset");
  const newPresetUI = document.getElementById(presetName);

  if (!newPresetUI)
    throw new Error(`Preset UI with id ${presetName} not found`);

  if (oldPresetUI) {
    oldPresetUI.classList.remove("activePreset");
  }
  newPresetUI.classList.add("activePreset");

  if (!JSON.parse(getPresets()) || !JSON.parse(getPresets())[presetName])
    loadDefault();

  const allPresetsData = JSON.parse(getPresets());
  const presetData = allPresetsData[presetName];
  if (!allPresetsData || !presetData) throw new Error("No presets data found");

  for (const buttonId in presetData.buys) {
    const buttonData = presetData.buys[buttonId];
    const button = document.getElementById(buttonId);
    if (!button || !buttonData)
      throw new Error(`Button ${buttonId} not found or data missing`);

    button.dataset.amount = buttonData.amount;
    button.dataset.symbol = buttonData.symbol;
    button.dataset.tooltip = `Buy ${buttonData.amount} SOL worth`;
    button.textContent = `${buttonData.amount}`;
  }

  for (const buttonId in presetData.sells) {
    const buttonData = presetData.sells[buttonId];
    const button = document.getElementById(buttonId);
    if (!button || !buttonData)
      throw new Error(`Button ${buttonId} not found or data missing`);

    button.dataset.amount = buttonData.amount;
    button.dataset.symbol = buttonData.symbol;
    if (buttonData.amount == 100) button.dataset.tooltip = `Sell all holdings`;
    else button.dataset.tooltip = `Sell ${buttonData.amount}% of holdings`;
    button.textContent = `${buttonData.amount}${buttonData.symbol}`;
  }
  localStorage.setItem("usingPreset", newPresetUI.id);
}
