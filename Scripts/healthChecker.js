import {ServerStatus} from "./Server/ServerStatus.js";
import {ChromeHandler} from "./ChromeHandler.js";

const Server = new ServerStatus();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "HEALTH_PING") {
        Server.getStatus().then((status) => {
            sendResponse(status);
            console.log("Health ping received. Status sent:", status);
        });
        return true;
    }
    if (msg.type === "OUTDATED") {
        console.log("Received outdated version message. Handling UI...");
        ChromeHandler.sendMessageAsync("OUTDATED_UI").then((response) => {
            sendResponse(response);
        });
        return true;
    }
});
