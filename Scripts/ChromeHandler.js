export class ChromeHandler {
    static sendMessageAsync(type, payload = null) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({origin: "TrenchersPaperTrading", type, payload: payload})
                .catch((e) => reject(e))
                .then(r => resolve(r));
        })
    }

    static sendMessage(type, payload = null) {
        chrome.runtime.sendMessage({origin: "TrenchersPaperTrading", type, payload: payload});
    }
}
