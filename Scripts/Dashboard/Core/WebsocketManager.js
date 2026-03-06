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
    }

    /**
     * Opens and authenticates the websocket connection.
     * @returns {Promise<void>}
     */
    async connect() {
        if (
            this.ws &&
            (this.ws.readyState === WebSocket.OPEN ||
                this.ws.readyState === WebSocket.CONNECTING)
        ) {
            console.log("Websocket already connected.");
            return;
        }

        const token = await StorageManager.getFromStorage("sessionToken");
        this.ws = new WebSocket(this.url);

        return new Promise((resolve, reject) => {
            let authTimeout;

            this.ws.onopen = () => {
                console.log("🔄 WebSocket connecting...");
                this.ws.send(
                    JSON.stringify({
                        type: "authenticate",
                        token,
                    }),
                );

                // Set a timeout for authentication (10s)
                authTimeout = setTimeout(() => {
                    reject(new AppError("WebSocket authentication timeout", {
                        code: "AUTH_TIMEOUT",
                        meta: {
                            token
                        }
                    }));
                    this.ws.close();
                }, 10000);
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "authenticated") {
                    authTimeout && clearTimeout(authTimeout);
                    this.reconnectAttempts = 0;
                    this.shouldReconnect = true;
                    this.#startHeartbeat();
                    resolve();
                }
            }

            this.ws.onerror = (err) => reject(new AppError(err));
        });
    }

    /**
     * Attaches runtime websocket event handlers.
     * @param {(data: any) => void} onMessage
     */
    loadWsEvents(onMessage) {
        this.onMessage = onMessage;

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "pong") {
                this.lastPong = Date.now();
                console.log("🏓 Pong received");
            } else if (data.type === "poolUpdate") {
                this.onMessage?.(data);
            } else
                console.warn("Unknown message type:", data.type, data);

            this.onMessage?.(data);
        };

        this.ws.onclose = () => {
            console.log("🛑 WebSocket disconnected, reconnecting...");
            this.ws = null;
            this.heartbeatInterval && clearInterval(this.heartbeatInterval);
            if (this.shouldReconnect)
                this.#reconnect();
        };

        this.ws.onerror = (err) => ErrorHandler.log(new AppError(err));
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
        this.heartbeatInterval && clearInterval(this.heartbeatInterval);
        this.ws?.close();
        this.ws = null;
        this.onMessage = null;
    }

    /**
     * Starts heartbeat ping cycle to monitor connection health.
     */
    #startHeartbeat() {
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
        if (this.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) return;

        const delay = CONFIG.BASE_DELAY * Math.pow(2, this.reconnectAttempts);

        setTimeout(() => {
            this.reconnectAttempts++;
            this.connect().catch((err) => {
                console.error("Reconnection failed:", err);
            }).finally(() =>
                this.loadWsEvents(this.onMessage)
            );
        }, delay);
    }
}
