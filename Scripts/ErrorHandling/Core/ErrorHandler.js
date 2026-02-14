import { AppError } from "../Helper/AppError.js";
import { ErrorHelper } from "../Helper/ErrorHelper.js";

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
    const e = this.normalize(err, meta);
    console.error(`[${e.code}] ${e.message}`, {
      meta: e.meta,
      cause: e.cause,
      stack: e.stack,
    });
    return e;
  }
}

/*
  handleError(
    error,
    context = "An error occurred",
    notif = {
      show: true,
      sound: true,
    },
  ) {
    let errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`${context}:`, errorMsg);
    if (notif.show)
      showNotification(`${context}: ${errorMsg}`, "error", notif.sound, error);
  }
*/
