import {ChromeHandler} from "../ChromeHandler.js";
import {API} from "./API.js";

export class ServerStatus {
    POLL_RATE = 1000 * 5;
    IDLE_TIMEOUT = 1000 * 60 * 60 * 1;

    lastPing = Date.now();
    interval = null;
    status = null;

    checking = false;

    /**
     * Starts health checking the server and notes lastPing
     * */
    async ping() {
        this.lastPing = Date.now();
        await this.startAndPing();
    }

    /**
     * Checks for lastPing and if was longer than @IDLE_TIMEOUT stops checking
     */
    async startAndPing() {
        await this.check();

        if (!this.interval)
            this.interval = setInterval(() => {
                if (Date.now() - this.lastPing > this.IDLE_TIMEOUT) {
                    clearInterval(this.interval);
                    this.interval = null;
                    return;
                }
                this.check();
            }, this.POLL_RATE);
    }

    /**
     * Checks the health of the server and updates status if changed
     * */
    async check() {
        if (this.checking) return;
        this.checking = true;
        let status = false;
        try {
            const response = await new API().createPublicRequest()
                .addEndpoint("/health")
                .addMethod("GET")
                .build();
            status = response.status === "ok";
        } catch (error) {
            status = false;
        } finally {
            if (this.status !== status || status === false) {
                if (typeof this.status === "boolean") {
                    console.log("Old status:", this.status, "New status:", status);
                    ChromeHandler.sendMessage("STATUS_UPDATE", {status: status});
                }
                this.status = status;
            }
            this.checking = false;
        }
    }

    /**
     * @returns {Promise<Boolean> | boolean} - Returns the current server status
     */
    async getStatus() {
        await this.ping();
        return this.status;
    }
}
