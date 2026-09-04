export class ChromeHandler {
    static isTrustedInternalSender(sender) {
        return (
            sender?.id === chrome.runtime.id &&
            sender?.origin ===
            `chrome-extension://${chrome.runtime.id}`
        );
    }

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
