import { getActivePreset, getPresets, setPresets } from "./presetManager.js";
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
      let amount = prompt("Enter new BUY label:", button.dataset.amount);
      if (amount == null || amount.trim() == "") {
        showNotification("Invalid input.", "error");
        return false;
      }
      amount = parseFloat(amount).toFixed(2);
      const activePreset = getActivePreset();
      const presets = getPresets();
      button.dataset.amount = amount;
      button.textContent = `${amount}`;
      if (presets[activePreset] && presets[activePreset].buys[button.id]) {
        presets[activePreset].buys[button.id].amount = amount;
        setPresets(presets);
      }
      return false;
    });
  });

  sellButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (window.editMode == false) return;
      let amount = prompt("Enter new SELL label:", button.dataset.amount);
      if (amount == null || amount.trim() == "") {
        showNotification("Invalid input.", "error");
        return false;
      }

      amount = parseInt(amount);
      const activePreset = getActivePreset();
      const presets = getPresets();
      button.dataset.amount = amount;
      button.textContent = `${amount} %`;
      if (presets[activePreset] && presets[activePreset].sells[button.id]) {
        presets[activePreset].sells[button.id].amount = amount;
        setPresets(presets);
      }
      return false;
    });
  });
});
