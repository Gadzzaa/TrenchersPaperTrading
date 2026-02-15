import { AppError } from "../Helper/AppError.js";
import { ErrorHelper } from "../Helper/ErrorHelper.js";
import { ErrorCodes } from "../Helper/ErrorCodes.js";
import { NotificationManager } from "../../Utils/Core/NotificationManager.js";

export class ErrorHandler {
  /**
   * A safe message to show in UI (toast/banner).
   * @param {unknown} err
   * @returns {string}
   */
  static userMessage(err) {
    const e = ErrorHelper.normalize(err);
    return ErrorCodes.UserMessages[e.code] || ErrorCodes.UserMessages.UNKNOWN;
  }

  /**
   * Consistent console logging. Returns the normalized AppError for rethrowing.
   * @param {unknown} err
   * @param {Record<string, any>} [meta]
   * @returns {AppError}
   */
  static log(err, meta = {}) {
    const e = ErrorHelper.normalize(err, meta);
    console.error(`[${e.code}] ${e.message}`, {
      meta: e.meta,
      cause: e.cause,
      stack: e.stack,
    });
    return e;
  }

  /**
   * @param {unknown} err
   * @param {{ show?: boolean, sound?: boolean }} [notif]
   */
  static show(err, notif = { show: true, sound: true }) {
    if (notif.show) {
      const notification = new NotificationManager()
        .addType("error")
        .addMessage(ErrorHandler.userMessage(err));

      if (notif.sound) notification.addSound();

      notification.build();
    }
  }
}
