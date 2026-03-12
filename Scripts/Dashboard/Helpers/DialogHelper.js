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

    static handleNoSession() {
        return new Promise(resolve => {
            const chromeListener = (message) => {
                if (message.origin !== "TrenchersPaperTrading") return;
                const shouldResolve = message.type === "SESSION_VALID_UI";
                if (!shouldResolve) return;
                chrome.runtime.onMessage.removeListener(chromeListener);
                resolve();
            }

            !chrome.runtime.onMessage.hasListener(chromeListener) &&
            chrome.runtime.onMessage.addListener(chromeListener);
        })
    }
}