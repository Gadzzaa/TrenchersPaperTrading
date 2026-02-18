import { AppError } from "../../ErrorHandling/Helpers/AppError.js";
export class EditHelper {
  static activateEditMode(stateManager) {
    const body = document.body;
    const sellsTab = document.getElementById("Sells");

    body.classList.add("edit-mode-exit");
    if (!stateManager.pnlService.isActive()) sellsTab.classList.add("hidden");

    // Wait for animation to finish
    setTimeout(() => {
      body.classList.remove("edit-mode", "edit-mode-exit");
    }, 400);
  }

  static deactivateEditMode() {
    const body = document.body;
    const sellsTab = document.getElementById("Sells");

    sellsTab.classList.remove("hidden");
    body.classList.add("edit-mode");
  }

  static editBuyPresets(
    presetData = { presets, activePreset },
    buttonData = { button, amount },
  ) {
    let presets,
      activePreset = presetData;
    let button,
      amount = buttonData;

    if (!presets[activePreset]?.buys[button.id])
      throw new AppError(
        `Buy button with id "${button.id}" not found in active preset.`,
        {
          code: "BUTTON_NOT_FOUND",
          meta: {
            presetData,
            buttonData,
          },
        },
      );

    presets[activePreset].buys[button.id].amount = amount;
  }

  static editSellPresets(
    presetData = { presets, activePreset },
    buttonData = { button, amount },
  ) {
    let presets,
      activePreset = presetData;
    let button,
      amount = buttonData;

    if (!presets[activePreset]?.sells[button.id])
      throw new Error(
        `Sell button with id ${button.id} not found in active preset.`,
      );

    presets[activePreset].sells[button.id].amount = amount;
  }
}
