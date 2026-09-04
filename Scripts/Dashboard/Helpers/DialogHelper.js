import {ChromeHandler} from "../../ChromeHandler.js";

export class DialogHelper {

    static handleNoInternet() {
        return new Promise(resolve => {
            const chromeListener = (message) => {
                if (message.origin !== "TrenchersPaperTrading") return;
                const shouldResolve = message.type === "STATUS_UPDATE" && message.payload.status === true;
                if (!shouldResolve) return;
                chrome.runtime.onMessage.removeListener(chromeListener);
                resolve();
            }

            !chrome.runtime.onMessage.hasListener(chromeListener) &&
            chrome.runtime.onMessage.addListener(chromeListener);
        })
    }

    static handleNoSession(stateManager) {
        return new Promise(resolve => {
            const chromeListener = (message, sender) => {
                if (message.origin !== "TrenchersPaperTrading") return;
                if (message.type !== "SESSION_VALID_UI") return;
                if (!ChromeHandler.isTrustedInternalSender(sender)) {
                    return;
                }

                const workerRevision = message.payload?.workerRevision;

                if (!stateManager.api.acceptWorkerRevision(workerRevision)) {
                    return;
                }

                chrome.runtime.onMessage.removeListener(chromeListener);
                resolve();
            }

            !chrome.runtime.onMessage.hasListener(chromeListener) &&
            chrome.runtime.onMessage.addListener(chromeListener);
        })
    }
}
