import { UIConfig } from "../Config/UIConfig.js";
export class UIHelper {
  static createButtons() {
    let actionButtons, closeButton;

    actionButtons = document.querySelectorAll(
      "#buyButtons .buyButton, #sellButtons .sellButton",
    );

    closeButton = document.getElementById("Close");
  }

  static createButtonEvents() {
    for (const button of actionButtons) {
      button.addEventListener("click", handleActionButtonClick(button));
    }

    closeButton.addEventListener("click", () => {
      requestHideApp();
    });
  }

  static createStorageEvents() {
    let storageChangeListener = UIConfig.storageChangeListener;

    // Remove existing listeners before adding new ones to prevent duplicates
    if (storageChangeListener)
      chrome.storage.onChanged.removeListener(storageChangeListener);

    chrome.storage.onChanged.addListener(storageChangeListener);
  }

  static createRuntimeEvents() {
    let runtimeMessageListener = UIConfig.runtimeMessageListener;

    // Remove existing listeners before adding new ones to prevent duplicates
    if (runtimeMessageListener) {
      chrome.runtime.onMessage.removeListener(runtimeMessageListener);
    }

    chrome.runtime.onMessage.addListener(runtimeMessageListener);
  }

  static disableAllTradeButtons(allButtons) {
    allButtons.forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("hidden");
    });
  }

  static enableAllTradeButtons(allButtons) {
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
