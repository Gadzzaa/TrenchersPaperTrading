import {API_Request} from "./API_Request.js";
import {AppError} from "../ErrorHandling/Helpers/AppError.js";
import {requestFreshToken} from "./API_Token_Refresher.js";

export class API {
    #accessToken = "";

    /** @type {Promise<string> | null} */
    #refreshInFlight = null;
    #loggingOut = false;

    constructor(token) {
        token ? this.#accessToken = token : null;
    }

    createPublicRequest() {
        return new API_Request();
    }

    createRequest() {
        if (!this.#accessToken)
            throw new AppError("Authentication required.", {
                code: "INVALID_SESSION"
            })

        return new API_Request({
            tokenRefresher: () => this.#refreshAccessToken()
        }).addJWT(this.#accessToken)
    }


    async login(username, password) {
        return this.#establish_session(
            "/login",
            {username, password},
        )
    }

    async register(username, password, balance) {
        return this.#establish_session(
            "/create-account",
            {username, password, balance},
        )
    }

    async restoreSession() {
        await this.#refreshAccessToken();
        return true
    }

    async logout() {
        if (this.#loggingOut)
            return;

        this.#loggingOut = true;

        try {
            if (this.#refreshInFlight) {
                try {
                    await this.#refreshInFlight;
                } catch {
                }
            }

            if (!this.#accessToken)
                return;

            return await this.createRequest()
                .includeCredentials()
                .addEndpoint("/logout")
                .addMethod("DELETE")
                .build();
        } finally {
            this.#accessToken = null;
            this.#loggingOut = false;
        }
    }

    async #refreshAccessToken() {
        if (this.#loggingOut) {
            throw new AppError("Session is logging out", {
                code: "SESSION_ENDING",
            });
        }
        if (this.#refreshInFlight)
            return this.#refreshInFlight;

        const operation = requestFreshToken(
            () => this.createPublicRequest(),
        ).then(token => {
            this.#accessToken = token;
            return token;
        })

        this.#refreshInFlight = operation

        try {
            return await operation;
        } finally {
            if (this.#refreshInFlight === operation)
                this.#refreshInFlight = null;
        }
    }

    async #establish_session(endpoint, body = null) {
        const request = this.createPublicRequest()
            .includeCredentials()
            .addEndpoint(endpoint)
            .addMethod("POST")

        if (body !== null) {
            request.addBody(body)
        }

        const response = await request.build()
        const {token, ...public_response} = response

        if (typeof token !== "string" || !token) {
            throw new AppError("Access token missing", {
                code: "INVALID_TOKEN",
            });
        }

        this.#accessToken = token;
        return public_response;
    }
}