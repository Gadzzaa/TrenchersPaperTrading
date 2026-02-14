export class MessageHandlers {
  requestCurrentContract() {
    return new Promise((resolve, reject) => {
      const requestId = "get-contract-" + Date.now();
      let timeoutId = null;

      // Listen for response
      function handleMessage(event) {
        // Security: Verify origin is from axiom.trade (parent page)
        if (
          !event.origin.includes("axiom.trade") &&
          event.origin !== window.location.origin
        ) {
          return;
        }

        const { type, contract, requestId: responseId } = event.data;
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

  requestHideApp() {
    window.parent.postMessage(
      {
        type: "HIDE_APP",
      },
      "https://axiom.trade",
    );
  }
}
