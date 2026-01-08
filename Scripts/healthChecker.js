import { ServerStatus } from "./backend/ServerStatus.js";

const Server = new ServerStatus();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "HEALTH_PING") {
    Server.ping();
    let status = Server.getStatus();
    sendResponse(status);
    console.log("Health ping received. Status sent:", Server.getStatus());
    return true;
  }
});
