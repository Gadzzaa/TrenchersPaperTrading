import { AppError } from "../ErrorHandling/Helpers/AppError.js";
import { BackendRequest } from "./BackendRequest.js";

export class ServerValidation {
  static #version = chrome.runtime.getManifest().version;

  /**
   *  @returns {Promise<boolean>} - true if the current version is the latest, false otherwise
   * */
  static async isLatestVersion() {
    const response = await new BackendRequest()
      .addEndpoint("/latest?version=" + this.#version)
      .addMethod("GET")
      .addRetries(2)
      .build();

    if (!response)
      throw new AppError("No data received from server", { code: "NO_DATA" });

    return response.ok;
  }
}
