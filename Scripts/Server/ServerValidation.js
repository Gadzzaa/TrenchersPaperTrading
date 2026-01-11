import { handleError } from "../utils.js";
import { BackendRequest } from "./BackendRequest.js";

export class ServerValidation {
  #manifest = chrome.runtime.getManifest();
  version = this.#manifest.version;

  /**
   *  @returns {Promise<boolean>} - true if the current version is the latest, false otherwise
   * */
  static async isLatestVersion() {
    try {
      const response = await new BackendRequest()
        .addEndpoint("/latest?version=" + this.version)
        .addMethod("GET")
        .addRetries(2)
        .build();
      return response.ok;
    } catch (error) {
      handleError(error, "Could not check latest version: ");
      return false;
    }
  }
}
