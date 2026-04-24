export class MessageHandlers {
    /**
     * Requests currently selected contract from parent window.
     * @returns {Promise<string|null>}
     */
    static requestCurrentContract() {
        return new Promise((resolve) => {
            const requestId = "get-contract-" + Date.now();
            let timeoutId = null;

            // Listen for response
            /**
             * Handles parent contract response messages.
             * @param {MessageEvent} event
             */
            function handleMessage(event) {
                // Security: Verify origin is from axiom.trade (parent page)
                if (
                    !event.origin.includes("axiom.trade") &&
                    event.origin !== window.location.origin
                ) {
                    return;
                }

                const {type, contract, requestId: responseId} = event.data;
                if (type === "CONTRACT_RESPONSE" && responseId === requestId) {
                    window.removeEventListener("message", handleMessage);
                    if (timeoutId) clearTimeout(timeoutId);
                    resolve(contract);
                }
            }

            window.addEventListener("message", handleMessage);

            // Add timeout to prevent orphaned listeners
            timeoutId = setTimeout(() => {
                window.removeEventListener("message", handleMessage);
                resolve(null); // Return null instead of rejecting to avoid breaking the flow
            }, 5000);

            // Send request to parent window (axiom.trade page)
            window.parent.postMessage(
                {
                    type: "CONTRACT_REQUEST",
                    requestId: requestId,
                },
                "https://axiom.trade",
            );
        });
    }

    /**
     * Requests parent app to hide dashboard iframe.
     */
    static requestHideApp() {
        window.parent.postMessage(
            {
                type: "HIDE_APP",
            },
            "https://axiom.trade",
        );
    }
}
