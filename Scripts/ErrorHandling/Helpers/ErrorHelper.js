import { ErrorCodes } from "./ErrorCodes.js";
import { AppError } from "./../Helper/AppError.js";

export class ErrorHelper {
  /**
   * Turn any thrown value into an AppError
   * @param {unknown} err
   * @param {Record<string, any>} [meta]
   * @returns {AppError}
   */
  static normalize(err, meta = {}) {
    if (err instanceof AppError) {
      // Merge meta if provided
      return new AppError(err.message, {
        code: err.code,
        cause: err.cause ?? err,
        meta: { ...err.meta, ...meta },
      });
    }

    if (err instanceof Error) {
      return new AppError(err.message || "Unknown error", {
        code: this.classify(err),
        cause: err,
        meta,
      });
    }

    // strings / objects thrown
    const msg = typeof err === "string" ? err : "Unknown error";
    return new AppError(msg, {
      code: this.classify(err),
      cause: err,
      meta,
    });
  }

  /**
   * Classify an unknown error into one of ErrorHandler.Codes
   * @param {unknown} err
   * @returns {string} one of ErrorCodes
   */
  static classify(err) {
    const Codes = ErrorCodes.Codes;
    const msg = String(err?.message ?? err ?? "").toLowerCase();

    // Chrome extension messaging / context quirks
    if (
      msg.includes("no receiving end") ||
      msg.includes("could not establish connection")
    )
      return Codes.NO_LISTENER;

    if (msg.includes("extension context invalidated"))
      return Codes.CONTEXT_INVALIDATED;

    // Fetch/network-ish
    if (msg.includes("failed to fetch") || msg.includes("networkerror"))
      return Codes.NETWORK;

    // AbortController / timeout-ish
    if (
      err?.name === "AbortError" ||
      msg.includes("aborted") ||
      msg.includes("timeout")
    )
      return Codes.TIMEOUT;

    // If you throw HTTP-like errors with status codes in message (optional)
    if (msg.includes("401")) return Codes.UNAUTHORIZED;
    if (msg.includes("403")) return Codes.FORBIDDEN;
    if (msg.includes("404")) return Codes.NOT_FOUND;
    if (msg.includes("429")) return Codes.RATE_LIMITED;
    if (msg.includes("400")) return Codes.BAD_REQUEST;
    if (
      msg.includes("500") ||
      msg.includes("502") ||
      msg.includes("503") ||
      msg.includes("504")
    )
      return Codes.SERVER;

    return Codes.UNKNOWN;
  }
}
