import { getPresets, setPresets } from "./presetManager.js";
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
      try {
        if (window.editMode == false) return;
        if (!button) throw new Error("Button not found.");

        let amount = prompt("Enter new BUY label:", button.dataset.amount);
        if (amount?.trim() == "") throw new Error("Invalid input.");

        amount = parseFloat(amount).toFixed(2);

        const activePreset = document.querySelector(".activePreset")?.id;
        if (!activePreset) throw new Error("No active preset found.");

        const presets = getPresets();
        if (!presets)
          throw new Error("Active preset not found in presets array.");

        button.dataset.amount = amount;
        button.textContent = `${amount}`;

        if (!presets[activePreset] || !presets[activePreset].buys[button.id])
          throw new Error(
            `Buy button with id ${button.id} not found in active preset.`,
          );

        presets[activePreset].buys[button.id].amount = amount;
        setPresets(presets);

        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        showNotification(
          "An error occurred while updating the buy label: " + message,
          "error",
        );
      }
    });
  });

  sellButtons.forEach((button) => {
    button.addEventListener("click", () => {
      try {
        if (window.editMode == false) return;
        let amount = prompt("Enter new SELL label:", button.dataset.amount);
        if (!amount?.trim() == "") throw new Error("Invalid input.");

        amount = parseInt(amount);

        const activePreset = document.querySelector(".activePreset")?.id;
        if (!activePreset) throw new Error("No active preset found.");

        const presets = getPresets();
        if (!presets)
          throw new Error("Active preset not found in presets array.");

        button.dataset.amount = amount;
        button.textContent = `${amount} %`;

        if (!presets[activePreset] && !presets[activePreset].sells[button.id])
          throw new Error(
            `Sell button with id ${button.id} not found in active preset.`,
          );

        presets[activePreset].sells[button.id].amount = amount;
        setPresets(presets);

        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        showNotification(
          "An error occurred while updating the sell label: " + message,
          "error",
        );
      }
    });
  });
});
