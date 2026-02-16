import { StorageHelper } from "../Helpers/StorageHelper.js";
import { AppError } from "../../ErrorHandling/Helper/AppError.js";

export class StorageManager {
  async getFromStorage(key) {
    try {
      return await StorageHelper.getFromStorage(key);
    } catch (err) {
      throw new AppError("Failed to get data from storage", {
        code: "STORAGE_GET_FAILED",
        cause: err,
        meta: { key },
      });
    }
  }

  async setToStorage(key, value) {
    try {
      await StorageHelper.setToStorage(key, value);
    } catch (err) {
      throw new AppError("Failed to set data to storage", {
        code: "STORAGE_SET_FAILED",
        cause: err,
        meta: { key, value },
      });
    }
  }
}
