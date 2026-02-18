import { UIConfig } from "../Config/UIConfig.js";
import { handleActions } from "./ActionHelper.js";
import { MessageHandlers } from "./MessageHandlers.js";
import { EditHelper } from "./EditHelper.js";

export class UIHelper {
  static createButtons(stateManager) {
    let actionButtons, closeButton, editButton;

    actionButtons = document.querySelectorAll(
      "#buyButtons .buyButton, #sellButtons .sellButton",
    );
    closeButton = document.getElementById("Close");
    editButton = document.getElementById("editPresets");

    for (const button of actionButtons) {
      button.addEventListener("click", () =>
        handleActions(button, stateManager),
      );
    }
    closeButton.addEventListener("click", () => {
      MessageHandlers.requestHideApp();
    });

    editButton.addEventListener("click", () => {
      EditHelper.toggleEditMode(stateManager);
    });
  }

  static createStorageEvents(stateManager) {
    let storageChangeListener =
      UIConfig.createStorageMessageListener(stateManager);

    // Remove existing listeners before adding new ones to prevent duplicates
    if (storageChangeListener)
      chrome.storage.onChanged.removeListener(storageChangeListener);

    chrome.storage.onChanged.addListener(storageChangeListener);
  }

  static createRuntimeEvents(stateManager) {
    let runtimeMessageListener =
      UIConfig.createRuntimeMessageListener(stateManager);

    // Remove existing listeners before adding new ones to prevent duplicates
    if (runtimeMessageListener) {
      chrome.runtime.onMessage.removeListener(runtimeMessageListener);
    }

    chrome.runtime.onMessage.addListener(runtimeMessageListener);
  }

  static disableAllTradeButtons() {
    const allButtons = document.querySelectorAll(
      "#buyButtons .buyButton, #sellButtons .sellButton",
    );
    allButtons.forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("hidden");
    });
  }

  static enableAllTradeButtons() {
    const allButtons = document.querySelectorAll(
      "#buyButtons .buyButton, #sellButtons .sellButton",
    );
    allButtons.forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("hidden");
    });
  }

  static clearUI() {
    let boughtText = document.getElementById("boughtText");
    let soldText = document.getElementById("soldText");
    let holdText = document.getElementById("holdText");
    let pnlText = document.getElementById("pnlText");

    boughtText.innerText = "0.0";
    soldText.innerText = "0.0";
    holdText.innerText = "0.0";
    pnlText.innerText = "+0.0 (0.00%)";
  }
}
