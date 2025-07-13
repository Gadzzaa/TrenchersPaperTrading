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

document.addEventListener("DOMContentLoaded", () => {
  const presetButtons = document.querySelectorAll("#Presets .preset");
  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyPreset(button.id);
    });
  });
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

export function getActivePreset() {
  return localStorage.getItem("activePreset");
}

export function applyPreset(presetName) {
  const oldPresetUI = document.getElementById(getActivePreset());
  const newPresetUI = document.getElementById(presetName);

  oldPresetUI.classList.remove("activePreset");
  newPresetUI.classList.add("activePreset");

  if (!JSON.parse(getPresets()) || !JSON.parse(getPresets())[presetName])
    loadDefault();
  const allPresetsData = JSON.parse(getPresets());
  const presetData = allPresetsData[presetName];

  for (const buttonId in presetData.buys) {
    const buttonData = presetData.buys[buttonId];
    const button = document.getElementById(buttonId);

    if (button && buttonData) {
      button.dataset.amount = buttonData.amount;
      button.dataset.symbol = buttonData.symbol;
      button.textContent = `${buttonData.amount} ${buttonData.symbol}`;
    } else {
      console.warn(`Buy button ${buttonId} not found or data missing.`);
    }
  }

  for (const buttonId in presetData.sells) {
    const buttonData = presetData.sells[buttonId];
    const button = document.getElementById(buttonId);

    if (button && buttonData) {
      button.dataset.amount = buttonData.amount;
      button.dataset.symbol = buttonData.symbol;
      button.textContent = `${buttonData.amount} ${buttonData.symbol}`;
    } else {
      console.warn(`Sell button ${buttonId} not found or data missing.`);
    }
  }

  localStorage.setItem("activePreset", newPresetUI.id);
}
