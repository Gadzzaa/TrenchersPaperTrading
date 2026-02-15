import CONFIG from "../../config.js";
import { AppError } from "../ErrorHandling/Helper/AppError.js";

const DEFAULT_TIMEOUT = 1000 * 5;
const API_BASE_URL = CONFIG.API_BASE_URL;

export class BackendRequest {
  constructor() {
    this.requestData = {
      endpoint: "",
      method: "",
      headers: {},
      body: null,
      retries: 0,
    };
    this.networkError = false;
  }

  /**
   * @param {string} endpoint - Notes the API endpoint to be used in the request
   * @returns {this}
   */
  addEndpoint(endpoint) {
    if (typeof endpoint !== "string")
      throw new AppError("Endpoint must be a string", {
        code: "INVALID_ENDPOINT",
        meta: {
          endpoint,
          type: typeof endpoint,
        },
      });
    this.requestData.endpoint = endpoint;
    return this;
  }

  /**
   * @param {string} method - HTTP method to be used in the request
   * @returns {this}
   */
  addMethod(method) {
    if (!["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method))
      throw new AppError("Invalid HTTP method", {
        code: "INVALID_METHOD",
        meta: {
          method,
        },
      });
    this.requestData.method = method;
    return this;
  }

  /**
   * @param {string | object} headers - Headers to be added to the request
   * @returns {this} -
   */
  addHeaders(headers) {
    if (
      (typeof headers !== "object" && typeof headers !== "string") ||
      headers === null
    )
      throw new AppError("Headers must be an object or a string", {
        code: "INVALID_HEADERS",
        meta: {
          headers,
          type: typeof headers,
        },
      });
    this.requestData.headers = { ...this.requestData.headers, ...headers };
    return this;
  }

  /**
   * @param {string} token - Session token to be added to the request
   * @returns {this}
   */
  addAuthParams(token) {
    if (typeof token !== "string")
      throw new AppError("Token must be a string", {
        code: "INVALID_TOKEN",
        meta: {
          token,
          type: typeof token,
        },
      });
    this.addHeaders({ Authorization: `Bearer ${token}` });
    return this;
  }

  /**
   * @param {string | object} body - Body to be added to the request
   * @returns {this} -
   */
  addBody(body) {
    if (typeof body !== "string" && typeof body !== "object" && body !== null)
      throw new AppError("Body must be a string, object, or null", {
        code: "INVALID_BODY",
        meta: {
          body,
          type: typeof body,
        },
      });
    this.requestData.body = body;
    this.addHeaders({ "Content-Type": "application/json" });
    return this;
  }

  /**
   * @param {number} retries - Retries to be added to the request
   * @returns {this} -
   */
  addRetries(retries) {
    this.requestData.retries = retries;
    return this;
  }

  /**
   * @param {Error} error - Error to be checked
   * @returns {Error | null}
   */
  isNetworkError(error) {
    return (
      error.name === "TypeError" &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("ERR_CONNECTION_REFUSED") ||
        error.message.includes("ERR_INTERNET_DISCONNECTED") ||
        error.message.includes("The network connection was lost"))
    );
  }

  static STATUS_MAP = Object.freeze({
    400: { code: "BAD_REQUEST", label: "Bad request" },
    401: { code: "UNAUTHORIZED", label: "Unauthorized" },
    403: { code: "FORBIDDEN", label: "Forbidden" },
    404: { code: "NOT_FOUND", label: "Not found" },
    429: { code: "RATE_LIMITED", label: "Too many requests" },
    500: { code: "SERVER", label: "Server error" },
    501: { code: "SERVER", label: "Server error" },
    502: { code: "SERVER", label: "Server error" },
  });

  /**
   * @param {Promise<Object>} response -
   * @param {Promise<Object>} responseJSON -
   */
  checkStatus(response, responseJSON) {
    const entry = BackendRequest.STATUS_MAP[response.status];
    if (!entry) return;

    if (response.status >= 500) this.networkError = true;

    throw new AppError(`${entry.label}: ${responseJSON.error}`, {
      code: entry.code,
      meta: { status: response.status, json: responseJSON },
    });
  }

  /**
   * Builder function to execute the request
   * @returns {Promise<Object>}
   */
  async build() {
    let response, responseJSON;
    for (let attempt = 0; attempt <= this.requestData.retries; attempt++) {
      this.networkError = false;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
      try {
        response = await fetch(API_BASE_URL + this.requestData.endpoint, {
          method: this.requestData.method,
          headers: this.requestData.headers,
          body: this.requestData.body,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        responseJSON = await response.json();
        if (response?.ok) break;
        this.checkStatus(response, responseJSON);
        throw new AppError("Unknown error occurred: " + responseJSON.error, {
          code: "UNKNOWN",
          meta: { status: response.status, json: responseJSON },
        });
      } catch (error) {
        if (this.isNetworkError(error) || this.networkError) {
          if (attempt === this.requestData.retries) {
            chrome.runtime.sendMessage({ type: "no-internet" });
            this.networkError = true;
            // TODO: disable UI with chrome.sendMessage to dashboard and popup
            throw new AppError("Network error: " + error.message, {
              code: "NETWORK",
              meta: { status: response.status, json: responseJSON },
            });
          }

          continue;
        }
        if (attempt === this.requestData.retries)
          throw new AppError("Request failed: " + error.message, {
            code: "TIMEOUT",
            meta: { status: response.status, json: responseJSON },
          });
      }
    }
    return responseJSON;
  }
}
