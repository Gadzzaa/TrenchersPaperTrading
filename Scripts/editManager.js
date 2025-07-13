import {
  savePresets,
  getActivePreset,
  getPresets,
  setPresets,
} from "./presetManager.js";
import { showNotification } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const editModeToggle = document.getElementById("editPresets");
  const buyButtons = document.querySelectorAll("#buyButtons .buyButton");
  const sellButtons = document.querySelectorAll("#sellButtons .sellButton");
  window.editMode = false;

  editModeToggle.addEventListener("click", () => {
    window.editMode = !window.editMode;
    if (window.editMode) {
      //TODO: Change color when edit mode is active
    } else {
      //TODO: Revert
    }
  });

  buyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (window.editMode == false) return;
      let newValue = prompt("Enter new BUY label:", button.dataset.amount);
      if (newValue == null || newValue.trim() == "") {
        showNotification("Invalid input.", "error");
        return false;
      }
      newValue = parseFloat(newValue).toFixed(2);
      const activePreset = getActivePreset();
      const presets = getPresets();
      button.dataset.amount = newValue;
      let amount = button.dataset.amount;
      button.textContent = `${amount}`;
      if (presets[activePreset] && presets[activePreset].buys[button.id]) {
        presets[activePreset].buys[button.id].amount = newValue;
        setPresets(presets); // update the presets object
        savePresets(); // save all presets
      }
      return false;
    });
  });

  sellButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (window.editMode == false) return;
      let newValue = prompt("Enter new SELL label:", button.dataset.amount);
      if (newValue == null || newValue.trim() == "") {
        showNotification("Invalid input.", "error");
        return false;
      }

      newValue = parseInt(newValue);
      const activePreset = getActivePreset();
      const presets = getPresets();
      button.dataset.amount = newValue;
      let amount = button.dataset.amount;
      let symbol = button.dataset.symbol;
      button.textContent = `${amount} ${symbol}`;
      if (presets[activePreset] && presets[activePreset].sells[button.id]) {
        presets[activePreset].sells[button.id].amount = newValue;
        setPresets(presets);
        savePresets();
      }
      return false;
    });
  });
});
