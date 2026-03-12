import {ServerStatus} from "./Server/ServerStatus.js";
import {ChromeHandler} from "./ChromeHandler.js";

const Server = new ServerStatus();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "HEALTH_PING") {
        Server.getStatus()
            .then((status) => {
                sendResponse(status);
                console.log("Health ping received. Status sent:", status);
            })
            .catch((error) => {
                console.error("Health ping failed:", error);
                sendResponse(false);
            });
        return true;
    }
    if (msg.type === "OUTDATED") {
        ChromeHandler.sendMessageAsync("OUTDATED_UI")
            .then((response) => {
                sendResponse(response ?? {ok: true});
            })
            .catch((error) => {
                console.error("OUTDATED handler failed:", error);
                sendResponse({ok: false, error: error?.message || String(error)});
            });
        return true;
    }
    if (msg.type === "NO_SESSION") {
        ChromeHandler.sendMessageAsync("NO_SESSION_UI")
            .then((response) => {
                sendResponse(response ?? {ok: true});
            })
            .catch((error) => {
                console.error("NO_SESSION handler failed:", error);
                sendResponse({ok: false, error: error?.message || String(error)});
            });
        return true;
    }
    if (msg.type === "SESSION_VALID") {
        console.log("Received SESSION_VALID message, validating session...");
        ChromeHandler.sendMessageAsync("SESSION_VALID_UI")
            .then((response) => {
                sendResponse(response ?? {ok: true});
            })
            .catch((error) => {
                console.error("SESSION_VALID handler failed:", error);
                sendResponse({ok: false, error: error?.message || String(error)});
            });
        return true;
    }
});
