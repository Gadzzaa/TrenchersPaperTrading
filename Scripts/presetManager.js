let activePreset = null;
let presets = {
  preset1: {
    buys: {
      BuyButton1: { amount: "0.1", symbol: "SOL" },
      BuyButton2: { amount: "0.25", symbol: "SOL" },
      BuyButton3: { amount: "0.5", symbol: "SOL" },
      BuyButton4: { amount: "1", symbol: "SOL" },
    },
    sells: {
      SellButton1: { amount: "10", symbol: "%" },
      SellButton2: { amount: "25", symbol: "%" },
      SellButton3: { amount: "50", symbol: "%" },
      SellButton4: { amount: "100", symbol: "%" },
    },
  },
  preset2: {
    buys: {
      BuyButton1: { amount: "0.25", symbol: "SOL" },
      BuyButton2: { amount: "0.5", symbol: "SOL" },
      BuyButton3: { amount: "0.75", symbol: "SOL" },
      BuyButton4: { amount: "1", symbol: "SOL" },
    },
    sells: {
      SellButton1: { amount: "10", symbol: "%" },
      SellButton2: { amount: "25", symbol: "%" },
      SellButton3: { amount: "50", symbol: "%" },
      SellButton4: { amount: "100", symbol: "%" },
    },
  },
  preset3: {
    buys: {
      BuyButton1: { amount: "0.5", symbol: "SOL" },
      BuyButton2: { amount: "0.75", symbol: "SOL" },
      BuyButton3: { amount: "1", symbol: "SOL" },
      BuyButton4: { amount: "1.25", symbol: "SOL" },
    },
    sells: {
      SellButton1: { amount: "10", symbol: "%" },
      SellButton2: { amount: "25", symbol: "%" },
      SellButton3: { amount: "50", symbol: "%" },
      SellButton4: { amount: "100", symbol: "%" },
    },
  },
  preset4: {
    buys: {
      BuyButton1: { amount: "1", symbol: "SOL" },
      BuyButton2: { amount: "2.5", symbol: "SOL" },
      BuyButton3: { amount: "5", symbol: "SOL" },
      BuyButton4: { amount: "10", symbol: "SOL" },
    },
    sells: {
      SellButton1: { amount: "10", symbol: "%" },
      SellButton2: { amount: "25", symbol: "%" },
      SellButton3: { amount: "50", symbol: "%" },
      SellButton4: { amount: "100", symbol: "%" },
    },
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const presetButtons = document.querySelectorAll(".presetsContainer button");
  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActivePreset(button.id);
    });
  });
});

export function getActivePreset() {
  return localStorage.getItem("activePreset");
}
export function getPresets() {
  return presets;
}

export function setActivePreset(presetName) {
  const presetButtons = document.querySelectorAll(".presetsContainer button");
  presetID = document.getElementById(presetName);

  presetButtons.forEach((btn) => btn.classList.remove("activePreset"));
  presetID.classList.add("activePreset");

  activePreset = presetID;
  localStorage.setItem("activePreset", activePreset);
  applyPreset(activePreset);
}
export function setPresets(newPresets) {
  presets = newPresets;
}

export function savePresets() {
  localStorage.setItem("presets", JSON.stringify(presets));
}

export function loadPresets() {
  const savedPresets = localStorage.getItem("presets");
  if (!savedPresets)
    console.warn("[loadPresets] No presets found in localStorage.");

  const parsed = JSON.parse(savedPresets);
  if (!parsed || typeof parsed !== "object")
    console.warn("[loadPresets] Invalid presets format in localStorage.");

  for (const presetName in parsed) {
    if (!presets[presetName]) {
      console.warn(
        `[loadPresets] Unknown preset '${presetName}' found, skipping.`,
      );
      continue;
    }
    if (parsed[presetName] == presets[presetName]) {
      console.warn("[loadPresets] Preset already exists, skipping.");
      continue;
    }

    // Buys
    for (const buyId in parsed[presetName].buys) {
      const buy = parsed[presetName].buys[buyId];

      if (
        buy !== null &&
        buy.amount !== "" &&
        buy.amount !== null &&
        buy.amount !== undefined
      ) {
        presets[presetName].buys[buyId] = buy;
      } else {
        console.warn(
          `[loadPresets] Blank BUY amount for ${buyId} in ${presetName}, skipping.`,
        );
        continue;
      }
    }

    // Sells
    for (const sellId in parsed[presetName].sells) {
      const sell = parsed[presetName].sells[sellId];

      if (
        sell !== null &&
        sell.amount !== "" &&
        sell.amount !== null &&
        sell.amount !== undefined
      ) {
        presets[presetName].sells[sellId] = sell;
      } else {
        console.warn(
          `[loadPresets] Blank SELL amount for ${sellId} in ${presetName}, skipping.`,
        );
        continue;
      }
    }
  }
}

export function applyPreset(presetName) {
  const preset = presets[presetName];
  if (!preset) {
    console.error(`No preset found for: ${presetName}`);
    return;
  }

  // Apply Buy buttons
  for (const buttonId in preset.buys) {
    const buttonData = preset.buys[buttonId];
    const button = document.getElementById(buttonId);

    if (button && buttonData) {
      button.dataset.amount = buttonData.amount;
      button.dataset.symbol = buttonData.symbol;
      button.textContent = `${buttonData.amount} ${buttonData.symbol}`;
    } else {
      console.warn(`Buy button ${buttonId} not found or data missing.`);
    }
  }

  // Apply Sell buttons
  for (const buttonId in preset.sells) {
    const buttonData = preset.sells[buttonId];
    const button = document.getElementById(buttonId);

    if (button && buttonData) {
      button.dataset.amount = buttonData.amount;
      button.dataset.symbol = buttonData.symbol;
      button.textContent = `${buttonData.amount} ${buttonData.symbol}`;
    } else {
      console.warn(`Sell button ${buttonId} not found or data missing.`);
    }
  }
}
