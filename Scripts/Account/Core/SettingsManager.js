import {SettingsAPI} from "../Helpers/SettingsAPI.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";

export class SettingsManager {
    /**
     * @param {StateManager} stateManager - Contains session and user variables.
     */
    constructor(stateManager) {
        this.settingsAPI = new SettingsAPI();
        this.api = stateManager.api;
    }

    /**
     * @param {Object} settings - Object containing user settings to be saved.
     */
    async saveSettings(settings) {
        try {
            await this.settingsAPI.saveSettings(this.api, settings);
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    /**
     * @returns {Promise<Object>} - Object containing user settings.
     * */
    async getSettings() {
        try {
            return await this.settingsAPI.getSettings(this.api);
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }
}
