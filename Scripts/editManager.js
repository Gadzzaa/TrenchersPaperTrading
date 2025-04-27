import { savePresets, getActivePreset, getPresets, setPresets } from './presetManager.js';
const editModeToggle = document.getElementById('editModeToggle');
const container = document.querySelector('.container');
const buyButtons = document.querySelectorAll('.buyButtons button');
const sellButtons = document.querySelectorAll('.sellButtons button');
let editMode = false;


editModeToggle.addEventListener('click', () => {
  editMode = !editMode;
  if (editMode) {
    container.classList.add('editModeActive');
  } else {
    container.classList.remove('editModeActive');
  }
});

buyButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    if (editMode) {
      e.preventDefault();
      e.stopImmediatePropagation(); // <--- FULLY stop the event from continuing
      const newValue = prompt('Enter new BUY label:', button.dataset.amount);
      const activePreset = getActivePreset();
      const presets = getPresets();
      if (newValue !== null && newValue.trim() !== '') {
        button.dataset.amount = newValue;
        let amount = button.dataset.amount;
        let symbol = button.dataset.symbol;
        button.textContent = `${amount} ${symbol}`;
        if (presets[activePreset] && presets[activePreset].buys[button.id]) {
          presets[activePreset].buys[button.id].amount = newValue;
          setPresets(presets); // update the presets object
          savePresets(); // save all presets
          console.log("Saved buyButton update for:", button.id, "in", activePreset);
        }
      }
      return;
    } else {
      // Normal Buy logic (your existing functionality)
      console.log('Normal Buy Action');
    }
  });
});

sellButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    if (editMode) {
      e.preventDefault();
      e.stopImmediatePropagation(); // <--- FULLY stop the event from continuing
      const newValue = prompt('Enter new SELL label:', button.dataset.amount);
      const activePreset = getActivePreset();
      const presets = getPresets();
      if (newValue !== null && newValue.trim() !== '') {
        button.dataset.amount = newValue;
        let amount = button.dataset.amount;
        let symbol = button.dataset.symbol;
        button.textContent = `${amount} ${symbol}`;
        if (presets[activePreset] && presets[activePreset].buys[button.id]) {
          presets[activePreset].buys[button.id].amount = newValue;
          setPresets(presets); // update the presets object
          savePresets(); // save all presets
          console.log("Saved buyButton update for:", button.id, "in", activePreset);
        }
      }
      return;
    } else {
      // Normal Sell logic (your existing functionality)
      console.log('Normal Sell Action');
    }
  });
});
