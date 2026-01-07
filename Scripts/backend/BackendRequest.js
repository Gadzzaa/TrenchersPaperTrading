import CONFIG from "../../config.js";
import { disableUI } from "../utils.js";

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
  }

  addEndpoint(endpoint) {
    if (!typeof endpoint === "string")
      throw new Error("Endpoint must be a string");
    this.requestData.endpoint = endpoint;
    return this;
  }

  addMethod(method) {
    if (!["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method))
      throw new Error("Invalid HTTP method");
    this.requestData.method = method;
    return this;
  }

  addHeaders(headers) {
    if (typeof headers !== "object" || headers === null)
      throw new Error("Headers must be an object");
    this.requestData.headers = { ...this.requestData.headers, ...headers };
    return this;
  }

  addBody(body) {
    if (typeof body !== "string" && typeof body !== "object" && body !== null)
      throw new Error("Body must be a string, object, or null");
    this.requestData.body = body;
    this.addHeaders({ "Content-Type": "application/json" });
    return this;
  }

  addRetries(retries) {
    this.requestData.retries = retries;
    return this;
  }

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

  checkStatus(response, responseJSON) {
    switch (response.status) {
      case 400:
        throw new Error("Bad request: " + responseJSON.error);
      case 401:
        throw new Error("Unauthorized.");
      case 403:
        throw new Error("Forbidden: " + responseJSON.error);
      case 404:
        throw new Error("Not found.");
      case 429:
        throw new Error("Too many requests. Please try again later.");
      case 500:
      case 501:
      case 502:
        networkError = true;
        throw new Error(
          "Server is currently unreachable. Please check your connection or try again later.",
        );
    }
  }

  async build() {
    let response,
      networkError = false,
      responseJSON;
    for (let attempt = 0; attempt <= this.requestData.retries; attempt++) {
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
        throw new Error(
          `Unknown error occured: ${result.error || response.statusText}`,
        );
      } catch (error) {
        if (this.isNetworkError(error)) {
          await disableUI("no-internet");
          chrome.runtime.sendMessage({ type: "no-internet" });
          networkError = true;
          throw new Error("Network is offline or server is unreachable.");
        }
        if (attempt === this.requestData.retries)
          throw new Error(error.message);
      }
    }
    return responseJSON;
  }
}
