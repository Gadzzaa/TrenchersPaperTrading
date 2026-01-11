import { BackendRequest } from "../../Server/BackendRequest.js";

export class SettingsAPI {
  /**
   * @param {string} sessionToken - Session token of the user
   * @param {Object} settings - Object containing user settings to be saved
   * @returns {Promise<Object>} - {success: boolean}
   */
  async saveSettings(sessionToken, settings) {
    return await new BackendRequest()
      .addEndpoint("/save-settings")
      .addMethod("POST")
      .addAuthParams(sessionToken)
      .addBody(JSON.stringify(settings))
      .addRetries(2)
      .build();
  }

  /**
   * @param {string} sessionToken - Session token of the user
   * @returns {Promise<Object>} - Contains user settings { settings: Object }
   */
  async getSettings(sessionToken) {
    return await new BackendRequest()
      .addEndpoint("/get-settings")
      .addMethod("GET")
      .addAuthParams(sessionToken)
      .build();
  }
}
