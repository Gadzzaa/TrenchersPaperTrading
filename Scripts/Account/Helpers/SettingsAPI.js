export class SettingsAPI {
    /**
     * @param {import("../../Server/API.js").API} api
     * @param {Object} settings - Object containing user settings to be saved
     * @returns {Promise<Object>} - {success: boolean}
     */
    saveSettings(api, settings) {
        return api.createRequest()
            .addEndpoint("/save-settings")
            .addMethod("POST")
            .addBody(settings)
            .addRetries()
            .build();
    }

    /**
     * @param {import("../../Server/API.js").API} api
     * @returns {Promise<Object>} - Contains user settings { settings: Object }
     */
    getSettings(api) {
        return api.createRequest()
            .addEndpoint("/get-settings")
            .addMethod("GET")
            .addRetries()
            .build();
    }
}
