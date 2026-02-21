export class StorageHelper {
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
