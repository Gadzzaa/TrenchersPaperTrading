import { getPresets, setPresets } from "./presetManager.js";
import { showNotification } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const editModeToggle = document.getElementById("editPresets");
  const buyButtons = document.querySelectorAll("#buyButtons .buyButton");
  const sellButtons = document.querySelectorAll("#sellButtons .sellButton");

  editModeToggle.addEventListener("click", () => {
    const body = document.body;

    if (body.classList.contains("edit-mode")) {
      body.classList.add("edit-mode-exit");

      // Wait for animation to finish
      setTimeout(() => {
        body.classList.remove("edit-mode", "edit-mode-exit");
      }, 400);
    } else {
      body.classList.add("edit-mode");
    }

    window.editMode = !window.editMode;
  });

  buyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      try {
        if (!document.body.classList.contains("edit-mode")) return;
        if (!button) throw new Error("Button not found.");

        let amount = prompt("Enter new BUY label:", button.dataset.amount);
        if (amount?.trim() == "") throw new Error("Invalid input.");

        amount = parseFloat(amount).toFixed(2);

        const activePreset = document.querySelector(".activePreset")?.id;
        if (!activePreset) throw new Error("No active preset found.");

        const presets = JSON.parse(getPresets());
        if (!presets)
          throw new Error("Active preset not found in presets array.");

        button.dataset.amount = amount;
        button.textContent = `${amount}`;

        if (!presets[activePreset] || !presets[activePreset].buys[button.id])
          throw new Error(
            `Buy button with id "${button.id}" not found in active preset.`,
          );

        presets[activePreset].buys[button.id].amount = amount;
        setPresets(presets);

        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        showNotification("[editManager.js]: " + message, "error");
      }
    });
  });

  sellButtons.forEach((button) => {
    button.addEventListener("click", () => {
      try {
        if (!document.body.classList.contains("edit-mode")) return;
        let amount = prompt("Enter new SELL label:", button.dataset.amount);
        if (!amount?.trim() == "") throw new Error("Invalid input.");

        amount = parseInt(amount);

        const activePreset = document.querySelector(".activePreset")?.id;
        if (!activePreset) throw new Error("No active preset found.");

        const presets = JSON.parse(getPresets());
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
        showNotification("[editManager.js]: " + message, "error");
      }
    });
  });
});
