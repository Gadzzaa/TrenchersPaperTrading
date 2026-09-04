import {API_Request} from "./API_Request.js";
import {AppError} from "../ErrorHandling/Helpers/AppError.js";
import {AUTH_ERROR_CODES} from "./API_Token_Refresher.js";
import {ChromeHandler} from "../ChromeHandler.js";

export class API {
    #accessToken = "";

    /** @type {Promise<string> | null} */
    #refreshInFlight = null;
    /** @type { Promise<Object> | null} */
    #sessionInFlight = null;
    #loggingOut = false;
    #sessionVersion = 0;
    #lastWorkerRevision = -1;


    createPublicRequest() {
        return new API_Request();
    }

    createRequest() {
        this.#throwIfLogginOut()

        if (!this.#accessToken)
            throw new AppError("Authentication required.", {
                code: "INVALID_SESSION"
            })

        return new API_Request({
            tokenRefresher: () => this.#refreshAccessToken(),
            assertCurrentSession: version => this.#assertSessionCurrent(version),
            version: this.#sessionVersion
        }).addJWT(this.#accessToken)
    }

    async login(username, password) {
        this.#throwIfLogginOut()

        if (this.#sessionInFlight || this.#refreshInFlight)
            throw new AppError("Another authentication operation is running.", {
                code: "AUTH_BUSY",
            });


        const operation = this.#establish_session(
            "AUTH_LOGIN",
            {username, password},
        )

        this.#sessionInFlight = operation

        try {
            return await operation
        } finally {
            if (this.#sessionInFlight === operation)
                this.#sessionInFlight = null
        }
    }

    async register(username, password, balance) {
        this.#throwIfLogginOut()

        if (this.#sessionInFlight || this.#refreshInFlight)
            throw new AppError("Another authentication operation is running.", {
                code: "AUTH_BUSY",
            });

        const operation = this.#establish_session(
            "AUTH_REGISTER",
            {username, password, balance},
        )

        this.#sessionInFlight = operation

        try {
            return await operation
        } finally {
            if (this.#sessionInFlight === operation)
                this.#sessionInFlight = null
        }
    }

    async restoreSession() {
        await this.#refreshAccessToken()
        return true
    }

    async logout() {
        if (this.#loggingOut) {
            throw new AppError("Session is logging out.", {
                code: "SESSION_ENDING",
            });
        }

        this.#loggingOut = true;
        this.invalidateSession()

        try {
            const reply = await ChromeHandler.sendMessageAsync("AUTH_LOGOUT");

            if (reply?.ok !== true) {
                throw new AppError(
                    reply?.error?.message || "Could not log out.",
                    {
                        code: reply?.error?.code || "AUTH_LOGOUT_FAILED",
                    }
                );
            }

            this.#requireWorkerRevision(reply.workerRevision);
        } finally {
            this.invalidateSession()
            this.#loggingOut = false;
        }
    }

    authenticateWebSocket(ws) {
        this.#throwIfLogginOut()

        ws.send(
            JSON.stringify({
                type: "authenticate",
                token: this.#accessToken,
            }),
        );
    }

    invalidateSession() {
        this.#sessionVersion++;
        this.#accessToken = "";
    }

    #assertSessionCurrent(version) {
        if (version !== this.#sessionVersion) {
            throw new AppError("Session changed during the operation.", {
                code: "SESSION_CHANGED",
            });
        }
    }

    async #requestFreshTokenFromWorker() {
        const response = await ChromeHandler.sendMessageAsync("AUTH_REFRESH");

        if (response?.ok !== true) {
            if (Number.isSafeInteger(response?.workerRevision)) {
                this.#requireWorkerRevision(
                    response.workerRevision
                );
            }

            throw new AppError(
                response?.error?.message || "Could not refresh session.",
                {
                    code: response?.error?.code || "AUTH_REFRESH_FAILED",
                }
            );
        }

        if (typeof response.token !== "string" || !response.token) {
            throw new AppError("Access token missing.", {
                code: "INVALID_SESSION",
            });
        }

        this.#requireWorkerRevision(response.workerRevision);

        return response.token;
    }


    async #refreshAccessToken() {
        this.#throwIfLogginOut()

        if (this.#refreshInFlight)
            return this.#refreshInFlight;

        const version = this.#sessionVersion

        const operation = this.#requestFreshTokenFromWorker()
            .then(token => {
                this.#assertSessionCurrent(version);
                this.#accessToken = token;
                return token;
            }).catch(error => {
                this.#assertSessionCurrent(version);
                if (AUTH_ERROR_CODES.has(error?.code)) {
                    this.invalidateSession()

                    void ChromeHandler.sendMessageAsync("NO_SESSION", {
                        workerRevision: this.#lastWorkerRevision
                    }).catch(
                        notificationError => {
                            console.error("Session notification failed:", notificationError);
                        }
                    );
                }

                throw error;
            });

        this.#refreshInFlight = operation

        try {
            return await operation;
        } finally {
            if (this.#refreshInFlight === operation)
                this.#refreshInFlight = null;
        }
    }

    async #establish_session(messageType, body = null) {
        const version = this.#sessionVersion

        const reply = await ChromeHandler.sendMessageAsync(messageType, body)

        this.#assertSessionCurrent(version)

        if (reply?.ok !== true) {
            throw new AppError(
                reply?.error?.message || "Could not establish session.",
                {
                    code: reply?.error?.code || "AUTH_SESSION_FAILED",
                }
            );
        }

        this.#requireWorkerRevision(reply.workerRevision);

        const {token, ...public_response} = reply.response ?? {}

        if (typeof token !== "string" || !token) {
            throw new AppError("Access token missing", {
                code: "INVALID_TOKEN",
            });
        }

        this.#sessionVersion++;
        this.#accessToken = token;

        return public_response;
    }

    #throwIfLogginOut() {
        if (this.#loggingOut)
            throw new AppError("Session is logging out", {
                code: "SESSION_ENDING",
            });
    }

    acceptWorkerRevision(incomingRevision) {
        if (!Number.isSafeInteger(incomingRevision) || incomingRevision < 0)
            return false;

        if (incomingRevision < this.#lastWorkerRevision)
            return false;

        this.#lastWorkerRevision = incomingRevision;
        return true;
    }

    getWorkerRevision() {
        return this.#lastWorkerRevision
    }

    #requireWorkerRevision(workerRevision) {
        if (!Number.isSafeInteger(workerRevision) || workerRevision < 0) {
            throw new AppError("Worker revision is missing or invalid.", {
                code: "INVALID_WORKER_REVISION",
            });
        }

        if (!this.acceptWorkerRevision(workerRevision)) {
            throw new AppError("Ignored an outdated authentication response.", {
                code: "STALE_AUTH_RESPONSE",
            });
        }
    }
}
