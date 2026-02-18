import { StorageHelper } from "../Helpers/StorageHelper.js";
import { AppError } from "../../ErrorHandling/Helpers/AppError.js";

export class StorageManager {
  static async getFromStorage(key) {
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

  static async setToStorage(key, value) {
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

  static async removeFromStorage(key) {
    try {
      await StorageHelper.removeFromStorage(key);
    } catch (err) {
      throw new AppError("Failed to remove data from storage", {
        code: "STORAGE_REMOVE_FAILED",
        cause: err,
        meta: { key },
      });
    }
  }
}
