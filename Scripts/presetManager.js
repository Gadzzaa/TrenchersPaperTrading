let activePreset = 'preset1'; // Default preset
let presets = {
  preset1: {
    buys: {
      BuyButton1: { amount: '0.1', symbol: 'SOL' },
      BuyButton2: { amount: '0.25', symbol: 'SOL' },
      BuyButton3: { amount: '0.5', symbol: 'SOL' },
      BuyButton4: { amount: '1', symbol: 'SOL' },
    },
    sells: {
      SellButton1: { amount: '10', symbol: '%' },
      SellButton2: { amount: '25', symbol: '%' },
      SellButton3: { amount: '50', symbol: '%' },
      SellButton4: { amount: '100', symbol: '%' },
    }
  },
  preset2: {
    buys: {
      BuyButton1: { amount: '0.25', symbol: 'SOL' },
      BuyButton2: { amount: '0.5', symbol: 'SOL' },
      BuyButton3: { amount: '0.75', symbol: 'SOL' },
      BuyButton4: { amount: '1', symbol: 'SOL' },
    },
    sells: {
      SellButton1: { amount: '10', symbol: '%' },
      SellButton2: { amount: '25', symbol: '%' },
      SellButton3: { amount: '50', symbol: '%' },
      SellButton4: { amount: '100', symbol: '%' },
    }
  },
  preset3: {
    buys: {
      BuyButton1: { amount: '0.5', symbol: 'SOL' },
      BuyButton2: { amount: '0.75', symbol: 'SOL' },
      BuyButton3: { amount: '1', symbol: 'SOL' },
      BuyButton4: { amount: '1.25', symbol: 'SOL' },
    },
    sells: {
      SellButton1: { amount: '10', symbol: '%' },
      SellButton2: { amount: '25', symbol: '%' },
      SellButton3: { amount: '50', symbol: '%' },
      SellButton4: { amount: '100', symbol: '%' },
    }
  },
  preset4: {
    buys: {
      BuyButton1: { amount: '1', symbol: 'SOL' },
      BuyButton2: { amount: '2.5', symbol: 'SOL' },
      BuyButton3: { amount: '5', symbol: 'SOL' },
      BuyButton4: { amount: '10', symbol: 'SOL' },
    },
    sells: {
      SellButton1: { amount: '10', symbol: '%' },
      SellButton2: { amount: '25', symbol: '%' },
      SellButton3: { amount: '50', symbol: '%' },
      SellButton4: { amount: '100', symbol: '%' },
    }
  }
};
document.addEventListener('DOMContentLoaded', () => {
  const presetButtons = document.querySelectorAll('.presetsContainer button');

  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      presetButtons.forEach(btn => btn.classList.remove('activePreset'));
      button.classList.add('activePreset');

      activePreset = button.id;
      applyPreset(activePreset);          // 🔥 apply the selected preset to buttons
      console.log("Applying preset: " + activePreset);
    });
  });
});
// Getters
export function getActivePreset() {
  return activePreset;
}

export function getPresets() {
  return presets;
}

// Setters
export function setActivePreset(presetName) {
  activePreset = presetName;
}

export function setPresets(newPresets) {
  presets = newPresets;
}

// Save and Load Presets
export function savePresets() {
  localStorage.setItem('presets', JSON.stringify(presets));
}

export function loadPresets() {
  const savedPresets = localStorage.getItem('presets');
  if (savedPresets !== null) {
    try {
      const parsed = JSON.parse(savedPresets);

      console.log("[loadPresets] Parsed Presets from Storage:", parsed);

      // Only copy valid fields
      for (const presetName in parsed) {
        if (!presets[presetName]) {
          console.warn(`[loadPresets] Unknown preset '${presetName}' found, skipping.`);
          continue;
        }

        // Buys
        for (const buyId in parsed[presetName].buys) {
          const buy = parsed[presetName].buys[buyId];

          if (!buy) {
            console.warn(`[loadPresets] Null or undefined buy for ${buyId} in ${presetName}, skipping.`);
            continue;
          }

          if (buy.amount !== "" && buy.amount !== null && buy.amount !== undefined) {
            presets[presetName].buys[buyId] = buy;
            console.log(`[loadPresets] Loaded BUY ${buyId} for ${presetName}:`, buy);
          } else {
            console.warn(`[loadPresets] Blank BUY amount for ${buyId} in ${presetName}, skipping.`);
          }
        }

        // Sells
        for (const sellId in parsed[presetName].sells) {
          const sell = parsed[presetName].sells[sellId];

          if (!sell) {
            console.warn(`[loadPresets] Null or undefined sell for ${sellId} in ${presetName}, skipping.`);
            continue;
          }

          if (sell.amount !== "" && sell.amount !== null && sell.amount !== undefined) {
            presets[presetName].sells[sellId] = sell;
            console.log(`[loadPresets] Loaded SELL ${sellId} for ${presetName}:`, sell);
          } else {
            console.warn(`[loadPresets] Blank SELL amount for ${sellId} in ${presetName}, skipping.`);
          }
        }
      }
    } catch (e) {
      console.error('[loadPresets] Failed to parse presets:', e);
      return;
    }
  } else {
    console.warn("[loadPresets] No saved presets found in storage.");
  }
}
// Apply Preset
export function applyPreset(presetName) {
  const preset = presets[presetName];
  if (!preset) {
    console.error(`No preset found for: ${presetName}`);
    return;
  }

  console.log(`Applying Preset: ${presetName}`, preset); // Debug print preset content

  // Apply Buy buttons
  for (const buttonId in preset.buys) {
    const buttonData = preset.buys[buttonId];
    const button = document.getElementById(buttonId);

    if (button && buttonData) {
      button.dataset.amount = buttonData.amount;
      button.dataset.symbol = buttonData.symbol;
      button.textContent = `${buttonData.amount} ${buttonData.symbol}`;
      console.log(`Updated ${buttonId}: Buy ${buttonData.amount}`);
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
      console.log(`Updated ${buttonId}: Sell ${buttonData.amount}`);
    } else {
      console.warn(`Sell button ${buttonId} not found or data missing.`);
    }
  }
}
