import { WebsocketConfig as CONFIG } from "../Config/Websocket.js";
import { StorageManager } from "../../Utils/Core/StorageManager.js";

export class WebsocketManager {
  constructor() {
    this.url = CONFIG.WS_URL;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.heartbeatInterval = null;
    this.lastPong = Date.now();
    this.onMessage = null;
  }

  async connect(onMessage) {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return this.ws;
    }

    this.onMessage = onMessage;

    const token = StorageManager.getFromStorage("sessionToken");
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
          reject(new Error("WebSocket authentication timeout"));
          this.ws.close();
        }, 10000);
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "authenticated") {
          authTimeout && clearTimeout(authTimeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.#startHeartbeat();
          resolve(this.ws);
        } else if (data.type === "pong") {
          this.lastPong = Date.now();
          console.log("🏓 Pong received");
        } else console.warn("Unknown message type:", data.type, data);

        this.onMessage?.(data);
      };
      this.ws.onclose = () => {
        console.log("🛑 WebSocket disconnected, reconnecting...");
        this.ws = null;
        this.isConnected = false;
        this.heartbeatInterval && clearInterval(this.heartbeatInterval);
        this.#reconnect();
      };
      this.ws.onerror = (err) => reject(err);
    });
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    this.heartbeatInterval && clearInterval(this.heartbeatInterval);
    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  #startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      if (Date.now() - this.lastPong > 60 * 1000) {
        console.warn("⚠️ WebSocket heartbeat timeout, forcing reconnect...");
        this.ws.close();
        return;
      }

      this.send({ type: "ping" });
    }, 15000);
  }

  #reconnect() {
    if (this.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) return;

    const delay = CONFIG.BASE_DELAY * Math.pow(2, this.reconnectAttempts++);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.onMessage).catch((err) => {
        console.error("Reconnection failed:", err);
      });
    }, delay);
  }
}
