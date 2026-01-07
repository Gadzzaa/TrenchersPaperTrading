import { getFromStorage } from "../utils.js";
export class BackendHelpers {
  static async getAuthHeaders() {
    const sessionToken = await getFromStorage("sessionToken");
    if (!sessionToken) {
      throw new Error("No sessionToken found. Please log in again.");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    };
  }

  static calculatePricePercentage(poolAddress, percentage, portfolio) {
    try {
      if (!portfolio?.tokens)
        throw new Error(portfolio.error || "No tokens found in portfolio.");

      const totalAmount = portfolio.tokens[poolAddress].amount;
      if (!totalAmount) throw new Error("No tokens found for this pool.");

      const amountToSell = parseFloat(totalAmount * (percentage / 100));
      if (amountToSell <= 0) throw new Error("No tokens to sell.");

      return amountToSell;
    } catch (error) {
      throw error;
    }
  }

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
    if (typeof balance != "number") balance = Number(balance);
  }
}
