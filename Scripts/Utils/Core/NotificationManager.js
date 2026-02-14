import { NotificationHelper } from "../Helpers/NotificationHelper.js";
// TODO: import getFromStorage

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
      throw new Error("Invalid notification type");
    this.type = type;
    return this;
  }

  /**
   * @param {string} message - Represents the notification message to be displayed.
   * @returns {this}
   */
  addMessage(message) {
    if (typeof message != "string" || message.trim() === "")
      throw new Error("Invalid notification message");
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
   * @param {Error} error - Error object to be associated with the notification.
   * @returns {this}
   */
  addError(error) {
    if (this.type !== "error")
      throw new Error("Cannot add error to non-error notification");
    if ((typeof error != Error) | (error == null))
      throw new Error("Invalid error object");
    this.error = error;
    return this;
  }

  /**
   * Builds and displays the notification based on the provided type, message, sound, and error (if applicable).
   * */
  build() {
    const sanitizedMessage = NotificationHelper.sanitizeText(this.message);
    let fullMessage = typeClasses[type] + " " + sanitizedMessage;
    if (this.type === "error" && this.error)
      fullMessage = NotificationHelper.buildErrorMessage(
        this.error,
        fullMessage,
      );

    getFromStorage("volume").then((vol) => {
      this.volume = vol ?? 1.0;
      let sound = NotificationHelper.getSound(this.type, this.volume);
      NotificationHelper.showNotification(this.type, fullMessage, sound).catch(
        (err) => {
          console.error("Failed to show notification:", err);
        },
      );
    });
  }
}
