import { USE_LOCAL } from "../../../config.js";
export class WebsocketConfig {
  static MAX_RECONNECT_ATTEMPTS = 5;
  static BASE_DELAY = 500; // milliseconds
  static WS_URL = USE_LOCAL
    ? "ws://localhost:3000/ws"
    : "wss://trencherspapertrading.xyz/ws";
}
