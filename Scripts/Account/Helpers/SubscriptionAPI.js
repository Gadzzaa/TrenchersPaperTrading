import {BackendRequest} from "../../Server/BackendRequest.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class SubscriptionAPI {
    /**
     * @param {string} type - "monthly" or "yearly".
     * @param {string} sessionToken - User session token.
     * @returns {Promise<Object>} - Object containing URL of the checkout session: { url: string }
     */
    async upgradeSubscription(type, sessionToken) {
        let lookup_key;
        if (type === "monthly") lookup_key = "pro_monthly";
        else lookup_key = "pro_yearly";

        const response = await new BackendRequest()
            .addEndpoint("/create-checkout-session")
            .addMethod("POST")
            .addAuthParams(sessionToken)
            .addBody(JSON.stringify({lookup_key}))
            .build();

        if (!response)
            throw new AppError("No data received from server", {code: "NO_DATA"});

        return response;
    }

    /**
     * @param {string} sessionToken - Session token of the user.
     * @returns {Promise<Object>} - Object containing URL of the customer portal session: { url: string }
     */
    async manageSubscription(sessionToken) {
        const response = await new BackendRequest()
            .addEndpoint("/create-portal-session")
            .addMethod("POST")
            .addAuthParams(sessionToken)
            .build();

        if (!response)
            throw new AppError("No data received from server", {code: "NO_DATA"});

        return response;
    }
}
