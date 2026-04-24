import {BackendRequest} from "../../Server/BackendRequest.js";

export class SettingsAPI {
    /**
     * @param {string} authToken - Session token of the user
     * @param {Object} settings - Object containing user settings to be saved
     * @returns {Promise<Object>} - {success: boolean}
     */
    async saveSettings(authToken, settings) {
        return await new BackendRequest()
            .addEndpoint("/save-settings")
            .addMethod("POST")
            .addAuthParams(authToken)
            .addBody(JSON.stringify(settings))
            .addRetries(2)
            .build();
    }

    /**
     * @param {string} authToken - Session token of the user
     * @returns {Promise<Object>} - Contains user settings { settings: Object }
     */
    async getSettings(authToken) {
        return await new BackendRequest()
            .addEndpoint("/get-settings")
            .addMethod("GET")
            .addAuthParams(authToken)
            .build();
    }
}
