export class AccountValidators {
  /**
   * @param {string} username - The username used for login .
   * @param {string} password - The password used for login.
   */
  static loginValidator(username, password) {
    if (!username || !password)
      throw new Error("Username and password are required.");
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      throw new Error(
        "Username can only contain letters, numbers, and underscores.",
      );
  }

  /**
   * @param {string} username - The username used for registering.
   * @param {string} password - The password used for registering.
   * @param {number} balance - The balance used for registering.
   */
  static registerValidator(username, password, balance) {
    if (!username || !password)
      throw new Error("Username and password are required.");
    if (username.length < 3)
      throw new Error("Username must be at least 3 characters.");
    if (username.length > 20)
      throw new Error("Username must be at most 20 characters.");
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      throw new Error(
        "Username can only contain letters, numbers, and underscores.",
      );
    if (password.length < 8)
      throw new Error("Password must be at least 8 characters.");
    if (password.length > 128)
      throw new Error("Password must be at most 128 characters.");
    if (!/[A-Z]/.test(password))
      throw new Error("Password must contain at least one uppercase letter.");
    if (!/[a-z]/.test(password))
      throw new Error("Password must contain at least one lowercase letter.");
    if (!/[0-9]/.test(password))
      throw new Error("Password must contain at least one number.");
    if (typeof balance != "number") {
      balance = Number(balance);
      if (!Number.isFinite(balance)) {
        throw new Error("Balance must be a valid number");
      }
    }
  }
}
