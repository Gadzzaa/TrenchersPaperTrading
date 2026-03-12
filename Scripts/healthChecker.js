import {ServerStatus} from "./Server/ServerStatus.js";

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
        chrome.runtime
            .sendMessage({
                origin: "TrenchersPaperTrading",
                type: "OUTDATED_UI",
            })
            .then((response) => sendResponse(response))
            .catch((error) =>
                sendResponse({
                    ok: false,
                    error: error?.message || "Failed to dispatch OUTDATED_UI.",
                }),
            );
        return true;
    }

    if (msg.type === "UP_TO_DATE" && !msg?.payload?.forwardedByWorker) {
        chrome.runtime.sendMessage({
            origin: "TrenchersPaperTrading",
            type: "UP_TO_DATE",
            payload: {
                ...(msg.payload || {}),
                forwardedByWorker: true,
            },
        });
        sendResponse({ok: true});
        return true;
    }
});
