import {acceptAuthNotification} from "../../Server/AuthNotification.js";

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
                if (message.type !== "SESSION_VALID_UI")
                    return;

                if (!acceptAuthNotification(message, sender, stateManager.api)) {
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
