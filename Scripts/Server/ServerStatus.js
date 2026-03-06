import {BackendRequest} from "./BackendRequest.js";

export class ServerStatus {
    POLL_RATE = 1000 * 5;
    IDLE_TIMEOUT = 1000 * 20;

    lastPing = 0;
    interval = null;
    status = null;

    checking = false;

    /**
     * Starts health checking the server and notes lastPing
     * */
    ping() {
        this.lastPing = Date.now();
        this.start();
    }

    /**
     * Checks for lastPing and if was longer than @IDLE_TIMEOUT stops checking
     */
    start() {
        if (this.interval) return;

        this.interval = setInterval(() => {
            if (Date.now() - this.lastPing > this.IDLE_TIMEOUT) {
                clearInterval(this.interval);
                this.interval = null;
                return;
            }
            this.check();
        }, this.POLL_RATE);

        this.check();
    }

    /**
     * Checks the health of the server and updates status if changed
     * */
    async check() {
        if (this.checking) return;
        this.checking = true;
        let status = false;
        try {
            const response = await new BackendRequest()
                .addEndpoint("/health")
                .addMethod("GET")
                .build();
            status = response.status === "ok";
        } catch (error) {
            status = false;
        } finally {
            console.log("Old status:", this.status, "New status:", status);
            if (this.status !== status) {
                this.status = status;
                chrome.runtime.sendMessage({
                    type: "STATUS_UPDATE",
                    status: this.status,
                });
            }
            this.checking = false;
        }
    }

    /**
     * @returns {Object<boolean>} - Returns the current server status
     */
    async getStatus() {
        if (this.status == null)
            await this.check();
        return {status: this.status};
    }
}
