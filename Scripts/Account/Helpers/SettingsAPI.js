export class SettingsAPI {
    /**
     * @param {import("./API.js").API} api
     * @param {Object} settings - Object containing user settings to be saved
     * @returns {Promise<Object>} - {success: boolean}
     */
    async saveSettings(api, settings) {
        return await api.createRequest()
            .addEndpoint("/save-settings")
            .addMethod("POST")
            .addBody(settings)
            .addRetries()
            .build();
    }

    /**
     * @param {import("./API.js").API} api
     * @returns {Promise<Object>} - Contains user settings { settings: Object }
     */
    async getSettings(api) {
        return await api.createRequest()
            .addEndpoint("/get-settings")
            .addMethod("GET")
            .addRetries()
            .build();
    }
}
