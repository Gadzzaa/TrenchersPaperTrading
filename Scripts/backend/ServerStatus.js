import { BackendRequest } from "./BackendRequest.js";

export class ServerStatus {
  POLL_RATE = 1000 * 5;
  IDLE_TIMEOUT = 1000 * 20;

  lastPing = 0;
  interval = null;
  status = null;

  checking = false;

  ping() {
    this.lastPing = Date.now();
    this.start();
  }

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

  async check() {
    if (this.checking) return;
    this.checking = true;
    let status = false;
    try {
      const response = await new BackendRequest()
        .addEndpoint("/health")
        .addMethod("GET")
        .build();
      status = response.status == "ok";
    } catch (error) {
      status = false;
    } finally {
      console.log("Old status:", this.status, "New status:", status);
      if (this.status != status) {
        this.status = status;
        chrome.runtime.sendMessage({
          type: "STATUS_UPDATE",
          status: this.status,
        });
      }
      this.checking = false;
    }
  }

  getStatus() {
    return { status: this.status };
  }
}
