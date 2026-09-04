import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class StorageManager {
    static async getFromStorage(key) {
        try {
            const result = await chrome.storage.local.get(key);
            return result[key];
        } catch (err) {
            throw new AppError("Failed to get data from storage", {
                code: "STORAGE_GET_FAILED",
                cause: err,
                meta: {key},
            });
        }
    }

    static async setToStorage(key, value) {
        try {
            await chrome.storage.local.set({
                [key]: value,
            });
        } catch (err) {
            throw new AppError("Failed to set data to storage", {
                code: "STORAGE_SET_FAILED",
                cause: err,
                meta: {key, value},
            });
        }
    }

    static async removeFromStorage(key) {
        try {
            await chrome.storage.local.remove(key);
        } catch (err) {
            throw new AppError("Failed to remove data from storage", {
                code: "STORAGE_REMOVE_FAILED",
                cause: err,
                meta: {key},
            });
        }
    }
}
