import { handleError } from "../../utils.js";
import { SettingsAPI } from "../Helpers/SettingsAPI.js";

export class SettingsManager {
  /**
   * @param {Variables} variables - Contains session and user variables.
   */
  constructor(variables) {
    this.api = new SettingsAPI();
    this.variables = variables;
  }

  /**
   * @param {Object} settings - Object containing user settings to be saved.
   */
  async saveSettings(settings) {
    try {
      await this.api.saveSettings(this.variables.getSessionToken(), settings);
    } catch (error) {
      handleError(error, "Could not save settings: ");
      throw error;
    }
  }

  /**
   * @returns {Promise<Object>} - Object containing user settings.
   * */
  async getSettings() {
    try {
      const response = await this.api.getSettings(
        this.variables.getSessionToken(),
      );
      return response;
    } catch (error) {
      handleError(error, "Could not get settings: ");
      throw error;
    }
  }
}
