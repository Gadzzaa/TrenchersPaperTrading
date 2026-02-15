import { StorageHelper } from "../Helpers/StorageHelper.js";
import { AppError } from "../../ErrorHandling/Helper/AppError.js";

export class StorageManager {
  getFromStorage(key) {
    StorageHelper.getFromStorage(key)
      .then((value) => {
        return value;
      })
      .catch((err) => {
        throw new AppError("Failed to get data from storage", {
          code: "STORAGE_GET_FAILED",
          meta: { key },
        });
      });
  }

  setToStorage(key, value) {
    StorageHelper.setToStorage(key, value).catch((err) => {
      throw new AppError("Failed to set data to storage", {
        code: "STORAGE_SET_FAILED",
        meta: { key, value },
      });
    });
  }
}
