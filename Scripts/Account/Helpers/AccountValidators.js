import { AppError } from "../../ErrorHandling/Core/AppError.js";
export class AccountValidators {
  /**
   * @param {string} username - The username used for login .
   * @param {string} password - The password used for login.
   */
  static loginValidator(username, password) {
    let errMsg = "";
    if (!username || !password) errMsg = "Username and password are required.";
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      errMsg = "Username can only contain letters, numbers, and underscores.";

    throw new AppError(errMsg, {
      code: "LOGIN_FAILED",
    });
  }

  /**
   * @param {string} username - The username used for registering.
   * @param {string} password - The password used for registering.
   * @param {number} balance - The balance used for registering.
   */
  static registerValidator(username, password, balance) {
    let errMsg = "";
    if (!username || !password) errMsg = "Username and password are required.";
    if (username.length < 3) errMsg = "Username must be at least 3 characters.";
    if (username.length > 20)
      errMsg = "Username must be at most 20 characters.";
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      errMsg = "Username can only contain letters, numbers, and underscores.";
    if (password.length < 8) errMsg = "Password must be at least 8 characters.";
    if (password.length > 128)
      errMsg = "Password must be at most 128 characters.";
    if (!/[A-Z]/.test(password))
      errMsg = "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password))
      errMsg = "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password))
      errMsg = "Password must contain at least one number.";
    if (typeof balance != "number") {
      balance = Number(balance);
      if (!Number.isFinite(balance)) {
        errMsg = "Balance must be a valid number.";
      }
    }
    throw new AppError(errMsg, {
      code: "REGISTRATION_FAILED",
    });
  }
}
