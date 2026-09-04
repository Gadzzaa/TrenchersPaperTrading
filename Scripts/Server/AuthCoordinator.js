import {requestFreshToken} from "./API_Token_Refresher.js";
import {API_Request} from "./API_Request.js";
import {AppError} from "../ErrorHandling/Helpers/AppError.js";
import {ChromeHandler} from "../ChromeHandler.js";
import {isValidWorkerRevision} from "./AuthRevision.js";

const WORKER_REVISION_KEY = "authWorkerRevision";

export class AuthCoordinator {
    #refreshInFlight = null;
    #sessionInFlight = null;
    #loggingOut = false;
    #sessionVersion = 0;
    #workerRevision = 0;
    #workerRevisionReady = null;
    #workerRevisionWriteInFlight = null;

    async refresh() {
        await this.#ensureWorkerRevisionReady();

        if (this.#loggingOut)
            throw new AppError("Session is logging out", {
                code: "SESSION_ENDING",
            });

        if (this.#sessionInFlight) {
            throw new AppError("Another authentication operation is running.", {
                code: "AUTH_BUSY",
            });
        }

        if (this.#refreshInFlight)
            return this.#refreshInFlight


        const version = this.#sessionVersion;
        const operation = requestFreshToken(
            () => new API_Request()
        )
            .then(token => {
                this.#assertSessionCurrent(version);
                return {
                    token,
                    workerRevision: this.#workerRevision,
                };
            })
            .catch(error => {
                this.#assertSessionCurrent(version);
                throw error;
            })
            .finally(() => {
                if (this.#refreshInFlight === operation) {
                    this.#refreshInFlight = null;
                }
            });

        this.#refreshInFlight = operation;
        return operation;
    }

    login(username, password) {
        return this.#runSessionOperation(
            "/login",
            {username, password}
        );
    }

    register(username, password, balance) {
        return this.#runSessionOperation(
            "/create-account",
            {username, password, balance}
        );
    }

    async logout() {
        await this.#ensureWorkerRevisionReady();

        if (this.#loggingOut) {
            throw new AppError("Session is logging out.", {
                code: "SESSION_ENDING",
            });
        }

        this.#loggingOut = true;
        this.#sessionVersion++;

        try {
            const workerRevision = await this.#nextWorkerRevision();

            void ChromeHandler.sendMessageAsync("NO_SESSION_UI", {
                workerRevision,
            }).catch(error => {
                console.error("Session notification failed:", error);
            });

            await Promise.allSettled(
                [this.#sessionInFlight, this.#refreshInFlight].filter(Boolean)
            );

            await new API_Request()
                .includeCredentials()
                .addEndpoint("/logout")
                .addMethod("DELETE")
                .build();

            return {workerRevision};
        } finally {
            this.#loggingOut = false;
        }

    }

    async #runSessionOperation(endpoint, body) {
        await this.#ensureWorkerRevisionReady();

        if (this.#loggingOut) {
            throw new AppError("Session is logging out", {
                code: "SESSION_ENDING",
            });
        }

        if (this.#sessionInFlight || this.#refreshInFlight) {
            throw new AppError(
                "Another authentication operation is running.",
                {
                    code: "AUTH_BUSY",
                }
            );
        }

        const operation =
            this.#establishSession(endpoint, body);

        this.#sessionInFlight = operation;

        try {
            return await operation;
        } finally {
            if (this.#sessionInFlight === operation)
                this.#sessionInFlight = null;
        }
    }

    #establishSession(endpoint, body = null) {
        const version = this.#sessionVersion;
        const request = new API_Request()
            .includeCredentials()
            .addEndpoint(endpoint)
            .addMethod("POST")

        if (body !== null) {
            request.addBody(body)
        }

        return request.build().then(
            async response => {
                this.#assertSessionCurrent(version);

                const workerRevision = await this.#nextWorkerRevision();
                this.#assertSessionCurrent(version);

                return {response, workerRevision};
            },
            error => {
                this.#assertSessionCurrent(version);
                throw error
            }
        );
    }

    async getWorkerRevision() {
        await this.#ensureWorkerRevisionReady();
        return this.#workerRevision;
    }

    #assertSessionCurrent(version) {
        if (version !== this.#sessionVersion) {
            throw new AppError("Session changed during the operation.", {
                code: "SESSION_CHANGED",
            });
        }
    }

    async #ensureWorkerRevisionReady() {
        if (!this.#workerRevisionReady) {
            this.#workerRevisionReady = chrome.storage.session
                .get(WORKER_REVISION_KEY)
                .then(stored => {
                    const revision = stored[WORKER_REVISION_KEY];

                    if (revision === undefined) return;

                    if (!isValidWorkerRevision(revision)) {
                        throw new AppError("Stored worker revision is invalid.", {
                            code: "INVALID_WORKER_REVISION",
                        });
                    }

                    this.#workerRevision = revision;
                });
        }

        await this.#workerRevisionReady;
    }

    async #nextWorkerRevision() {
        await this.#ensureWorkerRevisionReady();

        while (this.#workerRevisionWriteInFlight) {
            await this.#workerRevisionWriteInFlight;
        }

        const workerRevision = ++this.#workerRevision;
        const operation = chrome.storage.session.set({
            [WORKER_REVISION_KEY]: workerRevision,
        });

        this.#workerRevisionWriteInFlight = operation;

        try {
            await operation;
            return workerRevision;
        } finally {
            if (this.#workerRevisionWriteInFlight === operation) {
                this.#workerRevisionWriteInFlight = null;
            }
        }
    }

    async invalidate(expectedWorkerRevision) {
        await this.#ensureWorkerRevisionReady();

        if (!isValidWorkerRevision(expectedWorkerRevision)) {
            throw new AppError(
                "Worker revision is missing or invalid.",
                {
                    code: "INVALID_WORKER_REVISION",
                }
            );
        }

        if (expectedWorkerRevision !== this.#workerRevision) {
            return {
                invalidated: false,
                workerRevision: this.#workerRevision,
            };
        }

        if (this.#loggingOut) {
            return {
                invalidated: false,
                workerRevision: this.#workerRevision,
            };
        }

        if (this.#sessionInFlight || this.#refreshInFlight) {
            throw new AppError(
                "Another authentication operation is running.",
                {
                    code: "AUTH_BUSY",
                }
            );
        }

        const version = this.#sessionVersion;

        const operation = this.#nextWorkerRevision()
            .then(workerRevision => {
                this.#assertSessionCurrent(version);

                // Mark the coordinator's local session state as changed.
                this.#sessionVersion++;

                void ChromeHandler.sendMessageAsync(
                    "NO_SESSION_UI",
                    {workerRevision}
                ).catch(error => {
                    console.error(
                        "Session notification failed:",
                        error
                    );
                });

                return {
                    invalidated: true,
                    workerRevision,
                };
            })
            .finally(() => {
                if (this.#sessionInFlight === operation) {
                    this.#sessionInFlight = null;
                }
            });

        this.#sessionInFlight = operation;
        return operation;
    }
}
