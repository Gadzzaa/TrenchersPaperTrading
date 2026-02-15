import { setToStorage, removeFromStorage, handleError } from "../../utils.js";
import { UIManager } from "../../Utils/Core/UIManager.js";
import { AuthAPI } from "../Helpers/AuthAPI.js";

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

      await setToStorage("sessionToken", sessionToken);
      this.variables.setSessionToken(sessionToken);

      chrome.runtime.sendMessage({ type: "initDashboard" });
    } catch (error) {
      handleError(error, "Login failed: ");
      throw error;
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

      await setToStorage("sessionToken", sessionToken);
      this.variables.setSessionToken(sessionToken);

      chrome.runtime.sendMessage({ type: "initDashboard" });
    } catch (error) {
      handleError(error, "Registration failed: ");
      throw error;
    }
  }

  /**
   *  Logs out the current user.
   * */
  async logout() {
    try {
      await this.api.logout(this.variables.getSessionToken());

      removeFromStorage("sessionToken");
      this.variables.setSessionToken(null);

      chrome.runtime.sendMessage({ type: "logoutDashboard" });

      await UIManager.disableUI("no-session");
    } catch (error) {
      handleError(error, "Could not log out: ");
      throw error;
    }
  }
}
