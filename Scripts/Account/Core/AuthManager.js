import { StorageManager } from "../../Utils/Core/StorageManager.js";
import { UIManager } from "../../Utils/Core/UIManager.js";
import { AuthAPI } from "../Helpers/AuthAPI.js";
import { ErrorHandler } from "../../ErrorHandling/Core/ErrorHandler.js";

export class AuthManager {
  /**
   * @param {Variables} variables - Contains session and user variables.
   */
  constructor(variables) {
    this.api = new AuthAPI();
    this.variables = variables;
  }

  /**
   * Logs in the user with provided credentials.
   * */
  async login() {
    try {
      const sessionToken = await this.api.login(
        this.variables.getCredentials().username,
        this.variables.getCredentials().password,
      );

      await StorageManager.setToStorage("sessionToken", sessionToken);
      this.variables.setSessionToken(sessionToken);

      chrome.runtime.sendMessage({ type: "initDashboard" });
    } catch (error) {
      throw ErrorHandler.log(error);
    }
  }

  /**
   * Registers a new user with provided credentials and initial balance.
   * */
  async register() {
    try {
      const sessionToken = await this.api.register(
        this.variables.getCredentials().username,
        this.variables.getCredentials().password,
        this.variables.getBalance(),
      );

      await StorageManager.setToStorage("sessionToken", sessionToken);
      this.variables.setSessionToken(sessionToken);

      chrome.runtime.sendMessage({ type: "initDashboard" });
    } catch (error) {
      throw ErrorHandler.log(error);
    }
  }

  /**
   *  Logs out the current user.
   * */
  async logout() {
    try {
      await this.api.logout(this.variables.getSessionToken());

      StorageManager.removeFromStorage("sessionToken");
      this.variables.setSessionToken(null);

      chrome.runtime.sendMessage({ type: "logoutDashboard" });

      await UIManager.disableUI("no-session");
    } catch (error) {
      throw ErrorHandler.log(error);
    }
  }
}
