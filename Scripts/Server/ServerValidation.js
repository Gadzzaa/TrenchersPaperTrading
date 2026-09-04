import {AppError} from "../ErrorHandling/Helpers/AppError.js";
import {API} from "./API.js";

export class ServerValidation {
    static #version = chrome.runtime.getManifest().version;

    /**
     *  @returns {Promise<boolean>} - true if the current version is the latest, false otherwise
     * */
    static async isLatestVersion() {
        const response = await new API().createPublicRequest()
            .addEndpoint("/latest?version=" + this.#version)
            .addMethod("GET")
            .addRetries()
            .build();

        if (!response)
            throw new AppError("No data received from server", {code: "NO_DATA"});

        if (typeof response.ok === "boolean")
            return response.ok;

        return response.message !== "UPDATE_REQUIRED";
    }
}
