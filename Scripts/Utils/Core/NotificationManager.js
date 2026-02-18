import { NotificationHelper } from "../Helpers/NotificationHelper.js";
import { ErrorHandler } from "../../ErrorHandling/Core/ErrorHandler.js";
import { AppError } from "../../ErrorHandling/Helper/AppError.js";
import { StorageManager } from "../../Utils/Core/StorageManager.js";

export class NotificationManager {
  #typeClasses = {
    success: "✅",
    error: "❌",
    info: "ℹ",
  };

  constructor() {
    this.type = "";
    this.message = "";
    this.sound = false;
    this.error = null;
    this.sounds = {
      successSound: new Audio(chrome.runtime.getURL("Sounds/success.wav")),
      failSound: new Audio(chrome.runtime.getURL("Sounds/fail.wav")),
    };
  }

  /**
   * @param {string} type - Represents the type of notification (e.g., 'success', 'error', 'info').
   * @returns {this}
   */
  addType(type) {
    if (typeof type != "string" || !(type in this.#typeClasses))
      throw ErrorHandler.log(
        new AppError("Invalid notification type", {
          code: "INVALID_NOTIFICATION_TYPE",
          meta: { providedType: type },
        }),
      );
    this.type = type;
    return this;
  }

  /**
   * @param {string} message - Represents the notification message to be displayed.
   * @returns {this}
   */
  addMessage(message) {
    if (typeof message != "string" || message.trim() === "")
      throw ErrorHandler.log(
        new AppError("Invalid notification message", {
          code: "INVALID_NOTIFICATION_MESSAGE",
          meta: { providedMessage: message },
        }),
      );
    this.message = message;
    return this;
  }

  /**
   * Will enable sound for the notification.
   * @returns {this}
   */
  addSound() {
    this.sound = true;
    return this;
  }

  /**
   * @param {Error | AppError} error - Error object to be associated with the notification.
   * @returns {this}
   */
  addError(error) {
    if (this.type !== "error")
      throw ErrorHandler.log(
        new AppError("Cannot add error to non-error notification", {
          code: "INVALID_NOTIFICATION_TYPE",
          meta: { providedType: this.type },
        }),
      );
    if (!(error instanceof Error) && !(error instanceof AppError))
      throw ErrorHandler.log(
        new AppError("Invalid error object", {
          code: "INVALID_NOTIFICATION_MESSAGE",
          meta: { providedError: error },
        }),
      );
    this.error = error;
    return this;
  }

  /**
   * Builds and displays the notification based on the provided type, message, sound, and error (if applicable).
   * */
  build() {
    const sanitizedMessage = NotificationHelper.sanitizeText(this.message);
    let fullMessage = this.#typeClasses[this.type] + " " + sanitizedMessage;
    if (this.type === "error" && this.error)
      fullMessage = NotificationHelper.buildErrorMessage(
        this.error,
        fullMessage,
      );

    StorageManager.getFromStorage("volume").then((vol) => {
      this.volume = vol ?? 1.0;
      let sound = NotificationHelper.getSound(
        this.type,
        this.volume,
        this.sounds,
      );
      NotificationHelper.execNotification(fullMessage, sound).catch((err) => {
        ErrorHandler.log(
          new AppError("Failed to show notification", { cause: err }),
        );
      });
    });
  }
}
