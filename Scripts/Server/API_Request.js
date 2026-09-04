import * as APIHelper from './API_Helper.js';
import {shouldAttempt} from "./API_Token_Refresher.js";

const API_BASE_URL = APIHelper.API_BASE_URL
const NUM_OF_RETRIES = APIHelper.NUM_OF_RETRIES
const DEFAULT_TIMEOUT = APIHelper.DEFAULT_TIMEOUT

/**
 * @typedef {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} HttpMethod
 */

export class API_Request {
    #tokenRefresher
    #assertCurrentSession
    #version

    #endpoint = "";
    #method = "";
    #headers = {};
    /** @type {Object | null} */
    #body = null;
    retry = false;
    credentials = false;

    constructor({tokenRefresher = null, assertCurrentSession = null, version = null} = {}) {
        this.#tokenRefresher = tokenRefresher;
        this.#assertCurrentSession = assertCurrentSession;
        this.#version = version;
    }

    addJWT(token) {
        this.addHeaders({Authorization: `Bearer ${token}`});
        return this;
    }

    includeCredentials() {
        this.credentials = true;
        return this;
    }

    addEndpoint(endpoint) {
        APIHelper.validateEndpoint(endpoint)
        this.#endpoint = endpoint;
        return this;
    }

    /**
     * @param {HttpMethod} method
     */
    addMethod(method) {
        APIHelper.validateMethod(method);
        this.#method = method;
        return this;
    }

    addHeaders(headers) {
        APIHelper.validateHeaders(headers);
        this.#headers = {...this.#headers, ...headers};
        return this;
    }

    addBody(body) {
        APIHelper.validateBody(body);
        this.#body = body;
        this.addHeaders({"Content-Type": "application/json"});
        return this;
    }

    addRetries() {
        this.retry = true;
        return this;
    }

    async build() {
        let authRefreshAttempted = false;
        let maxAttempts = this.retry ? NUM_OF_RETRIES : 1;
        for (let retry = 1; retry <= maxAttempts; retry++) {
            const controller = new AbortController();
            let response, json;

            const timeout = setTimeout(
                () => controller.abort(
                    APIHelper.createTimeoutReason(this.#method, this.#endpoint)
                ),
                DEFAULT_TIMEOUT,
            );

            try {
                this.#assertCurrentSession?.(this.#version);
                response = await fetch(
                    this.#getRequestUrl(),
                    this.#getFetchParams(controller.signal)
                );

                json = await APIHelper.parseResponse(response);

                this.#assertCurrentSession?.(this.#version);

                if (response.ok)
                    return json;

                APIHelper.throwForErrorResponse(response, json);
            } catch (error) {
                if (
                    !authRefreshAttempted &&
                    shouldAttempt(this.#endpoint, this.#headers, error)
                ) {

                    this.#assertCurrentSession?.(this.#version)
                    authRefreshAttempted = true;

                    if (typeof this.#tokenRefresher === "function") {
                        let token = await this.#tokenRefresher();
                        this.addJWT(token);

                        retry--;

                        continue;
                    }
                }

                if (
                    (APIHelper.isTimeoutError(error) || APIHelper.isNetworkError(error)) &&
                    (retry < maxAttempts)
                )
                    continue;


                APIHelper.throwMappedError(error, {
                    response,
                    json,
                    url: this.#getRequestUrl(),
                    method: this.#method,
                    retry,
                    max_retries: maxAttempts
                });
            } finally {
                clearTimeout(timeout);
            }
        }

    }

    #getRequestUrl() {
        return API_BASE_URL + this.#endpoint;
    }

    #getFetchParams(signal) {
        return {
            method: this.#method,
            headers: this.#headers,
            body: this.#body == null
                ? undefined
                : JSON.stringify(this.#body),
            credentials: this.credentials ? "include" : "omit",
            signal
        }
    }
}
