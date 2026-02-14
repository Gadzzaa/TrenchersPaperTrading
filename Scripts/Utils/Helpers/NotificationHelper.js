import { getDebugMode } from "../../../config.js";

export class NotificationHelper {
  /**
   * @param {string} text - Message text to be sanitized.
   * @returns {string} - Sanitized HTML string.
   */
  static sanitizeText(text) {
    if (typeof text !== "string") {
      text = String(text);
    }
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML.toString();
  }

  /**
   * @param {Error} error - Error object to extract location from.
   * @param {number} depth - Depth in the stack trace to extract (default is 2).
   * @returns {Object} - Object with the following structure:
   * {
   *  file: string,
   *  line: number,
   * }
   */
  static extractErrorLocation(error, depth = 2) {
    if (!error?.stack) return null;

    const line = error.stack.split("\n")[depth];

    const match = line?.match(/\(?(.+):(\d+):(\d+)\)?$/);
    if (!match) return null;

    return {
      file: match[1].split("/").pop(),
      line: Number(match[2]),
    };
  }

  /**
   * @param {string} type - Type of sound to play ('success' or 'error').
   * @param {number} volume - Volume level (0.0 to 1.0).
   * @returns {HTMLAudioElement} - Audio object configured with the specified sound and volume.
   */
  static getSound(type, volume, sound = {}) {
    let sound;
    switch (type) {
      case "success":
        sound = new Audio(successSound.src);
        break;
      case "error":
        sound = new Audio(failSound.src);
        break;
      default:
        return;
    }

    sound.volume = volume.toFixed(2);
    return sound;
  }

  /**
   * @param {Error} error - Error object to extract location from.
   * @param {string} message - Error message to be displayed.
   * @returns {string} - Error message with location info if in debug mode.
   */
  static buildErrorMessage(error, message) {
    const caller = extractErrorLocation(error);
    return getDebugMode()
      ? `[ ${caller?.file.toString().toUpperCase()}:${caller?.line} ] ${message}`
      : message;
  }

  /**
   * Send a message to the injector to show a notification.
   * @param {string} message - Message to be sent to the injector.
   */
  static sendMessageToInjector(message) {
    window.parent.postMessage(
      {
        type: "SHOW_NOTIFICATION",
        message: message,
      },
      "https://axiom.trade",
    );
  }

  /**
   * @param {string} type - Represents the type of notification (e.g., 'success', 'error', 'info').
   * @param {string} message - The message to be displayed in the notification.
   * @param {HTMLAudioElement} sound -
   */
  static execNotification(type, message, sound) {
    Promise.allSettled([sendMessageToInjector(type, message), sound.play()]);
  }
}
