import { savePresets, getActivePreset, getPresets, setPresets } from './presetManager.js';
const editModeToggle = document.getElementById('editModeToggle');
const container = document.querySelector('.container');
const buyButtons = document.querySelectorAll('.buyButtons button');
const sellButtons = document.querySelectorAll('.sellButtons button');
window.editMode = false;


editModeToggle.addEventListener('click', () => {
  window.editMode = !window.editMode;
  if (window.editMode) {
    container.classList.add('editModeActive');
  } else {
    container.classList.remove('editModeActive');
  }
});

buyButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (window.editMode == false) return;
    let newValue = prompt('Enter new BUY label:', button.dataset.amount);
    if (newValue !== null && newValue.trim() !== '') {
      newValue = parseFloat(newValue); // first parse to number
      newValue = parseFloat(newValue).toFixed(2);
      const activePreset = getActivePreset();
      const presets = getPresets();
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
    return false;
  });
});

sellButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (window.editMode == false) return;
    let newValue = prompt('Enter new SELL label:', button.dataset.amount);
    if (newValue !== null && newValue.trim() !== '') {
      newValue = parseInt(newValue); // first parse to number
      const activePreset = getActivePreset();
      const presets = getPresets();
      button.dataset.amount = newValue;
      let amount = button.dataset.amount;
      let symbol = button.dataset.symbol;
      button.textContent = `${amount} ${symbol}`;
      if (presets[activePreset] && presets[activePreset].sells[button.id]) {
        presets[activePreset].sells[button.id].amount = newValue;
        setPresets(presets); // update the presets object
        savePresets(); // save all presets
        console.log("Saved buyButton update for:", button.id, "in", activePreset);
      }
    }
    return false;
  });
});
