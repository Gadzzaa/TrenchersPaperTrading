export class ChromeHandler {
    static isTrustedInternalSender(sender) {
        if (sender?.id !== chrome.runtime.id)
            return false;

        const extensionOrigin =
            `chrome-extension://${chrome.runtime.id}`;
        const extensionUrlPrefix = `${extensionOrigin}/`;

        const isExtensionDocument =
            sender.origin === extensionOrigin ||
            (
                typeof sender.url === "string" &&
                sender.url.startsWith(extensionUrlPrefix)
            );

        const isExtensionWorker =
            sender.tab == null &&
            sender.origin == null &&
            sender.url == null;

        return isExtensionDocument || isExtensionWorker;
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
