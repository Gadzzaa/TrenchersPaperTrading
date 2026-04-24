import CONFIG from "../../config.js";
import {AppError} from "../ErrorHandling/Helpers/AppError.js";
import {ChromeHandler} from "../ChromeHandler.js";
import {AuthRefreshManager} from "./AuthRefreshManager.js";

const DEFAULT_TIMEOUT = 1000 * 5;
const API_BASE_URL = CONFIG.API_BASE_URL;

export class BackendRequest {
    static STATUS_MAP = Object.freeze({
        400: {code: "BAD_REQUEST", label: "Bad request"},
        401: {code: "UNAUTHORIZED", label: "Unauthorized"},
        408: {code: "TIMEOUT", label: "Request timeout"},
        403: {code: "FORBIDDEN", label: "Forbidden"},
        404: {code: "NOT_FOUND", label: "Not found"},
        429: {code: "RATE_LIMITED", label: "Too many requests"},
        500: {code: "SERVER", label: "Server error"},
        501: {code: "SERVER", label: "Server error"},
        502: {code: "SERVER", label: "Server error"},
        503: {code: "SERVER", label: "Server error"},
        504: {code: "SERVER", label: "Server error"},
    });

    constructor() {
        this.requestData = {
            endpoint: "",
            method: "",
            headers: {},
            body: null,
            retries: 0,
            checkStatus: true,
            autoRefreshAuth: true,
            bypassCredentials: false,
        };
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
        this.requestData.headers = {...this.requestData.headers, ...headers};
        return this;
    }

    /**
     * @param {string} token - JWT access token to be added to the request
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
        this.addHeaders({Authorization: `Bearer ${token}`});
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
        this.addHeaders({"Content-Type": "application/json"});
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

    bypassCredentials() {
        this.requestData.bypassCredentials = true;
        return this;
    }


    /**
     * @param {Error} error - Error to be checked
     * @returns {boolean | null}
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

    /**
     * @param {Error} error
     * @returns {boolean}
     */
    isTimeoutError(error) {
        return error?.name === "AbortError";
    }

    bypassStatusCheck() {
        this.requestData.checkStatus = false;
        return this;
    }

    disableAuthRefresh() {
        this.requestData.autoRefreshAuth = false;
        return this;
    }

    getRequestUrl() {
        return API_BASE_URL + this.requestData.endpoint;
    }

    getFetchOptions(signal) {
        return {
            method: this.requestData.method,
            headers: this.requestData.headers,
            body: this.requestData.body,
            credentials: this.requestData.bypassCredentials ? "omit" : "include",
            signal,
        };
    }

    /**
     * @param {Response} response
     * @param {Object} responseJSON
     */
    checkStatus(response, responseJSON) {
        const entry = BackendRequest.STATUS_MAP[response.status] || {
            code: "UNKNOWN",
            label: `HTTP ${response.status}`,
        };

        if (!this.requestData.checkStatus) return;

        const backendMessage =
            (typeof responseJSON?.error === "string" && responseJSON.error.trim()) ||
            (typeof responseJSON?.message === "string" && responseJSON.message.trim()) ||
            entry.label;
        const errorLooksLikeCode =
            typeof responseJSON?.error === "string" &&
            /^[A-Z0-9_]+$/.test(responseJSON.error.trim());
        const backendCode =
            (errorLooksLikeCode && responseJSON.error.trim()) ||
            (typeof responseJSON?.code === "string" && responseJSON.code.trim()) ||
            entry.code;

        throw new AppError(backendMessage, {
            code: backendCode,
            meta: {
                status: response.status,
                json: responseJSON,
                requestId: responseJSON?.requestId,
            },
        });
    }

    /**
     * @param {Response} response
     * @returns {Promise<Object>}
     */
    async parseResponse(response) {
        const contentType = response.headers.get("content-type") || "";
        const rawText = await response.text();

        if (!rawText) return {};

        if (contentType.includes("application/json")) {
            try {
                return JSON.parse(rawText);
            } catch (_error) {
            }
        }

        try {
            return JSON.parse(rawText);
        } catch (_error) {
            return {message: rawText};
        }
    }

    /**
     * @returns {Promise<{response: Response, json: Object}>}
     */
    async executeRequest() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
        try {
            const response = await fetch(this.getRequestUrl(), this.getFetchOptions(controller.signal));
            const json = await this.parseResponse(response);
            return {response, json};
        } finally {
            clearTimeout(timeout);
        }
    }

    /**
     * @param {unknown} error
     * @param {{response?: Response, json?: Object}} context
     */
    throwMappedError(error, context = {}) {
        const isTimeout = this.isTimeoutError(error);
        const isNetwork = this.isNetworkError(error);
        const response = context.response;
        const json = context.json;

        if (isTimeout || isNetwork) {
            ChromeHandler.sendMessage("no-internet");
            throw new AppError(
                `${isTimeout ? "Request timed out" : "Network error"}: ${error.message}`,
                {
                    code: isTimeout ? "TIMEOUT" : "NETWORK",
                    cause: error,
                    meta: {status: response?.status, json},
                },
            );
        }

        if (error instanceof AppError) throw error;

        throw new AppError("Request failed: " + (error?.message || "Unknown error"), {
            code: error?.code || "UNKNOWN",
            cause: error,
            meta: {status: response?.status, json},
        });
    }

    /**
     * Builder function to execute the request
     * @returns {Promise<Object>}
     */
    async build() {
        let authRefreshAttempted = false;

        for (let attempt = 0; attempt <= this.requestData.retries; attempt++) {
            try {
                const {response, json} = await this.executeRequest();
                if (response.ok || json?.ok === true) return json;
                this.checkStatus(response, json);
                return json;
            } catch (error) {
                if (
                    !authRefreshAttempted &&
                    AuthRefreshManager.shouldAttempt({
                        requestData: this.requestData,
                        error,
                    })
                ) {
                    try {
                        const refreshedToken = await AuthRefreshManager.refreshAccessToken();
                        AuthRefreshManager.attachRefreshedToken(this.requestData, refreshedToken);
                        authRefreshAttempted = true;
                        continue;
                    } catch {
                        authRefreshAttempted = true;
                    }
                }

                if ((this.isTimeoutError(error) || this.isNetworkError(error)) && attempt < this.requestData.retries) {
                    continue;
                }

                if (attempt === this.requestData.retries) {
                    this.throwMappedError(error);
                }
            }
        }

        return {};
    }
}
