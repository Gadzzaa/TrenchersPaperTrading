import { UIHelper } from "./UIHelper.js";
import { updateBalanceUI } from "../Helpers/BalanceUpdater.js";
import { ErrorHandler } from "../../ErrorHandling/Core/ErrorHandler.js";
import { ActionHelper } from "../Helpers/ActionHelper.js";
import { EditHelper } from "../Helpers/EditHelper.js";
import { PresetManager } from "../Core/PresetManager.js";

export class ActionManager {
  static handleActions(button, stateManager) {
    try {
      if (document.body.classList.contains("edit-mode")) {
        ActionManager.#handleEditActions(button, stateManager);
      } else ActionManager.#handleBasicActions(button, stateManager);
    } catch (error) {
      ErrorHandler.show(error);
    }
  }

  static async #handleBasicActions(button, stateManager) {
    UIHelper.disableAllTradeButtons();
    // TODO: Implement the startLoadingDots functionality here

    let Constants = {
      transactionManager: null,
      poolAddress: null,
      action: null,
      dataAmount: null,
      button: button,
    };

    ActionHelper.loadAndValidateBasicConstants(Constants, stateManager);

    if (Constants.action === "buy")
      await ActionHelper.handleBuy(
        Constants.transactionManager,
        Constants.poolAddress,
        stateManager,
      );
    if (Constants.action === "sell")
      await ActionHelper.handleSell(Constants.transactionManager, stateManager);

    await updateBalanceUI(true);
    // TODO: Implement the stopLoadingDots functionality here
    UIHelper.enableAllTradeButtons();
  }

  static #handleEditActions(button, stateManager) {
    let activePreset = stateManager.currentPreset;
    let presets = JSON.parse(PresetManager.getPresets());

    let action = button.dataset.action;
    let amount = prompt(
      `Enter new ${action.toUpperCase()} label:`,
      button.dataset.amount,
    );
    if (amount?.trim() == "") throw new Error("Invalid input.");

    if (action === "buy") {
      amount = parseFloat(amount).toFixed(2);
      button.textContent = `${amount}`;
      button.dataset.amount = amount;

      EditHelper.editBuyPresets({ presets, activePreset }, { button, amount });
    } else {
      amount = Number(amount);
      button.textContent = `${amount} %`;
      button.dataset.amount = amount;

      EditHelper.editSellPresets({ presets, activePreset }, { button, amount });
    }

    PresetManager.setPresets(presets);
  }
}
