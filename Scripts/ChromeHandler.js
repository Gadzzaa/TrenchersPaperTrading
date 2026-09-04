export class ChromeHandler {
    static isTrustedInternalSender(sender) {
        return (
            sender?.id === chrome.runtime.id &&
            sender?.origin ===
            `chrome-extension://${chrome.runtime.id}`
        );
    }

    static sendMessageAsync(type, payload = null) {
        return chrome.runtime.sendMessage({
            origin: "TrenchersPaperTrading",
            type,
            payload,
        });
    }

    static sendMessage(type, payload = null) {
        void this.sendMessageAsync(type, payload)
            .catch(error => {
                console.error(
                    `Failed to send Chrome message "${type}":`,
                    error
                );
            });
    }
}
