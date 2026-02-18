export class AppError extends Error {
  /**
   * @param {string} message
   * @param {{code?: string, cause?: unknown, meta?: Record<string, any>}} [opts]
   */
  constructor(message, { code = "UNKNOWN", cause = null, meta = {} } = {}) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.cause = cause;
    this.meta = meta;

    if (Error.captureStackTrace) Error.captureStackTrace(this, AppError);
  }
}
