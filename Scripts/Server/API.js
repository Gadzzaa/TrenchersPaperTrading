import {API_Request} from "./API_Request";
import {AppError} from "../ErrorHandling/Helpers/AppError";

export class API {
    #accessToken = "";
    #refreshInFlight = false;

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

        return new API_Request().addJWT(this.#accessToken)
    }


    async login(username, password) {
        return this.#establish_session(
            "/login",
            {username, password},
        )
    }

    async register(username, password, balance) {
        return this.#establish_session(
            "/register",
            {username, password, balance},
        )
    }

    async restoreSession() {
        return this.#establish_session("/refresh-session")
    }

    async logout() {
        try {
            return await this.createRequest()
                .includeCredentials()
                .addEndpoint("/logout")
                .addMethod("DELETE")
                .build();
        } finally {
            this.#accessToken = null;
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