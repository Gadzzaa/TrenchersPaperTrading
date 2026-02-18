export class StorageHelper {
  /**
   * @param {HTMLButtonElement} button - Button element to show loading dots on
   * @returns {number} - Interval ID to clear later
   */
  static startLoadingDots(button) {
    let dots = 0;
    button.dataset.originalText = button.textContent; // save original text
    document.body.style.pointerEvents = "none";

    const interval = setInterval(() => {
      dots = (dots + 1) % 4; // 0 → 1 → 2 → 3 → 0
      button.textContent = ".".repeat(dots);
    }, 250);

    return interval; // return interval ID so you can clear it later
  }

  /**
   * @param {HTMLButtonElement} button - Button element to stop loading dots on
   * @param {number} interval - Interval ID returned by startLoadingDots
   */
  static stopLoadingDots(button, interval) {
    clearInterval(interval);
    button.textContent = button.dataset.originalText;
    document.body.style.pointerEvents = "auto";
  }

  /**
   * @param {string} key - Key to retrieve from storage
   * @returns {Promise<string>} - Key value from storage
   */
  static getFromStorage(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (res) => resolve(res[key]));
    });
  }

  /**
   * @param {string} key - Key to set in storage
   * @param {string} value - Value to set in storage
   */
  static setToStorage(key, value) {
    return new Promise(() => {
      chrome.storage.local.set({ [key]: value });
      resolve();
    });
  }

  /**
   * @param {string} key - Key to remove from storage
   */
  static removeFromStorage(key) {
    return new Promise(() => {
      chrome.storage.local.remove([key]);
      resolve();
    });
  }
}
