import {ServerStatus} from "./Server/ServerStatus.js";

const Server = new ServerStatus();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "HEALTH_PING") {
        Server.ping();
        let status = Server.getStatus().then(() => {
            sendResponse(status);
            console.log("Health ping received. Status sent:", status);
        });
    }
});
