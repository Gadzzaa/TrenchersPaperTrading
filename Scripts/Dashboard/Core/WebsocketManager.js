import {WebsocketConfig as CONFIG} from "../Config/Websocket.js";
import {StorageManager} from "../../Utils/Core/StorageManager.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";

export class WebsocketManager {
    /**
     * Initializes websocket connection state.
     */
    constructor() {
        this.url = CONFIG.WS_URL;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.heartbeatInterval = null;
        this.lastPong = Date.now();
        this.onMessage = null;
        this.shouldReconnect = true;

        this.reconnectInterval = null;

        this.connectAttemptSeq = 0;
        this.activeAttemptId = 0;
    }


    /**
     * Opens and authenticates the websocket connection.
     * @returns {Promise<void>}
     */
    async connect(onMessage) {
        if (
            this.ws &&
            (this.ws.readyState === WebSocket.OPEN ||
                this.ws.readyState === WebSocket.CONNECTING)
        ) {
            console.log("Websocket already connected.");
            return;
        }

        const attemptId = ++this.connectAttemptSeq
        this.activeAttemptId = attemptId;

        const token = await StorageManager.getFromStorage("sessionToken");
        if (!token) throw new AppError("No session token provided.", {
            code: "INVALID_SESSION",
            meta: {
                ws: this.ws,
                activeAttemptId: this.activeAttemptId,
            }
        })
        const ws = new WebSocket(this.url);
        this.ws = ws;

        const isStale = () => attemptId !== this.activeAttemptId || ws !== this.ws;
        const logCtx = (phase, extra = {}) => ({
            phase,
            ts: new Date().toISOString(),
            attemptId,
            activeAttemptId: this.activeAttemptId,
            isStale: isStale(),
            shouldReconnect: this.shouldReconnect,
            reconnectAttempts: this.reconnectAttempts,
            wsReadyState: ws?.readyState,
            ...extra
        });


        return new Promise((resolve, reject) => {
            let authTimeout, settled = false;

            ws.onopen = () => {
                if (isStale() || settled) return;
                console.log("🔄 WebSocket connecting...");
                ws.send(
                    JSON.stringify({
                        type: "authenticate",
                        token: token,
                    }),
                );

                // Set a timeout for authentication (10s)
                authTimeout = setTimeout(() => {
                    settled = true;
                    reject(new AppError("WebSocket authentication timeout", {
                        code: "AUTH_TIMEOUT",
                        meta: {
                            ws: this.ws,
                            activeAttemptId: this.activeAttemptId,
                        }
                    }));
                    this.disconnect();
                }, 15000);
            };

            ws.onmessage = (event) => {
                if (isStale() || settled) return;
                try {
                    const data = JSON.parse(event.data);
                    if (data.error) {
                        settled = true;
                        authTimeout && clearTimeout(authTimeout);
                        reject(new AppError(`WebSocket authentication failed: ${data.error}`, {
                            code: "WEBSOCKET_AUTH_FAILED",
                            meta: {
                                ws: this.ws,
                                activeAttemptId: this.activeAttemptId,
                                response: data,
                            }
                        }));
                        this.disconnect();
                        return;
                    }

                    if (data.type === "authenticate" && data.success === true) {
                        console.log("Websocket authenticated.")
                        settled = true;
                        authTimeout && clearTimeout(authTimeout);
                        this.reconnectInterval && clearTimeout(this.reconnectInterval)
                        this.reconnectAttempts = 0;
                        this.shouldReconnect = true;
                        this.lastPong = Date.now();
                        this.#startHeartbeat();
                        this.#loadWsEvents(onMessage, isStale, logCtx);
                        resolve();
                    }
                } catch (e) {
                    settled = true;
                    authTimeout && clearTimeout(authTimeout);
                    reject(new AppError("WebSocket authentication response was invalid JSON.", {
                        code: "WEBSOCKET_BAD_AUTH_RESPONSE",
                        cause: e,
                        meta: {
                            ws: this.ws,
                            activeAttemptId: this.activeAttemptId,
                            payload: event?.data,
                        }
                    }));
                    this.disconnect();
                }
            }

            let safeReject = () => {
                settled = true;
                this.ws = null;
                authTimeout && clearTimeout(authTimeout);
                reject(new AppError("WebSocket disconnected during connection attempt.", {
                    code: "WEBSOCKET_CONNECTION_ERROR",
                    meta: {
                        attemptId,
                        ws,
                        activeAttemptId: this.activeAttemptId,
                        activeWs: this.ws
                    }
                }));
            }

            ws.onclose = (e) => {
                if (isStale() || settled) return;
                console.error("[WS_CLOSE]", logCtx("connect", {
                    code: e.code, reason: e.reason, wasClean: e.wasClean
                }));
                safeReject();
            }

            ws.onerror = (e) => {
                if (isStale() || settled) return;
                console.error("[WS_ERROR]", logCtx("connect", {
                    errorType: e.type
                }));
                safeReject();
            }
        });
    }

    /**
     * Attaches runtime websocket event handlers.
     * @param {(data: any) => void} onMessage
     * @param {Function} isStale
     * @param {Function} logCtx
     */
    #loadWsEvents(onMessage, isStale, logCtx) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        this.onMessage = onMessage;

        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;

        this.ws.onmessage = (event) => {
            if (isStale()) return;
            try {
                const data = JSON.parse(event.data);

                if (data.type === "pong") {
                    this.lastPong = Date.now();
                    console.log("🏓 Pong received");
                } else if (data.type === "poolUpdate") {
                    this.onMessage?.(data);
                } else if (data.error) {
                    console.warn("[WS_SERVER_ERROR]", data.error);
                } else
                    console.warn("Unknown message type:", data.type, data);
            } catch (e) {
                console.error("[WS_ERROR]", e);
            }
        };

        this.ws.onclose = (e) => {
            if (isStale()) return;
            console.error("[WS_CLOSE]", logCtx("loadWsEvents", {
                code: e.code, reason: e.reason, wasClean: e.wasClean
            }));
            this.ws = null;
            this.heartbeatInterval && clearInterval(this.heartbeatInterval);
            this.reconnectInterval && clearTimeout(this.reconnectInterval);
            if (this.shouldReconnect)
                this.#reconnect();
        };

        this.ws.onerror = (e) => {
            console.error("[WS_ERROR]", logCtx("loadWsEvents", {
                errorType: e.type
            }));
            ErrorHandler.log(new AppError(e));
        }
    }

    /**
     * Sends a serialized payload over websocket when connected.
     * @param {Record<string, any>} data
     */
    send(data) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    /**
     * Closes websocket and resets runtime state.
     */
    disconnect() {
        this.shouldReconnect = false;
        this.reconnectAttempts = 0;
        this.activeAttemptId = ++this.connectAttemptSeq;
        this.heartbeatInterval && clearInterval(this.heartbeatInterval);
        this.reconnectInterval && clearTimeout(this.reconnectInterval);
        this.ws?.close();
        this.ws = null;
        this.onMessage = null;
    }

    /**
     * Starts heartbeat ping cycle to monitor connection health.
     */
    #startHeartbeat() {
        this.heartbeatInterval && clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

            if (Date.now() - this.lastPong > 60 * 1000) {
                console.warn("⚠️ WebSocket heartbeat timeout, forcing reconnect...");
                this.ws.close();
                return;
            }

            this.send({type: "ping"});
        }, 15000);
    }

    /**
     * Schedules reconnect with exponential backoff.
     */
    #reconnect() {
        if (this.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
            console.error("Websocket reconnect failed.")
            return;
        }

        const delay = CONFIG.BASE_DELAY * Math.pow(2, this.reconnectAttempts);

        this.reconnectInterval = setTimeout(async () => {
            this.reconnectAttempts++;

            try {
                await this.connect(this.onMessage);
            } catch (e) {
                console.error(e);
            }
        }, delay);
    }
}
