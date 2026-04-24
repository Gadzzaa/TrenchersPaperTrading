export class ChromeHandler {
    static sendMessageAsync(type, payload = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await chrome.runtime.sendMessage({
                    origin: "TrenchersPaperTrading",
                    type,
                    payload: payload
                })
                resolve(response);
            } catch (e) {
                reject(e);
            }
        });
    }

    static sendMessage(type, payload = null) {
        chrome.runtime.sendMessage({origin: "TrenchersPaperTrading", type, payload: payload});
    }
}
