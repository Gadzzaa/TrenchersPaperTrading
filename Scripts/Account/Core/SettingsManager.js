import {SettingsAPI} from "../Helpers/SettingsAPI.js";

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
    saveSettings(settings) {
        return this.settingsAPI.saveSettings(this.api, settings);
    }

    /**
     * @returns {Promise<Object>} - Object containing user settings.
     * */
    getSettings() {
        return this.settingsAPI.getSettings(this.api);
    }
}
