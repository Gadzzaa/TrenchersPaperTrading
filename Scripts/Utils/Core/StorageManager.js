import { StorageHelper } from "../Helpers/StorageHelper.js";

export class StorageManager {
  getFromStorage(key) {
    StorageHelper.getFromStorage(key)
      .then((value) => {
        return value;
      })
      .catch((err) => {
        throw err;
      });
  }

  setToStorage(key, value) {
    StorageHelper.setToStorage(key, value).catch((err) => {
      throw err;
    });
  }
}
