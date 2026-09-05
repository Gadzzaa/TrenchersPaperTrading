import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

const SUBSCRIPTION_LOOKUP_KEYS = Object.freeze({
    monthly: "pro_monthly",
    yearly: "pro_yearly",
});

export class SubscriptionAPI {
    /**
     * @param {string} type - "monthly" or "yearly".
     * @param {import("../../Server/API.js").API} api
     * @returns {Promise<Object>} - Object containing URL of the checkout session: { url: string }
     */
    async upgradeSubscription(type, api) {
        const lookupKey = SUBSCRIPTION_LOOKUP_KEYS[type];

        if (!lookupKey) {
            throw new AppError("Unsupported subscription type.", {
                code: "INVALID_DATA",
                meta: {type},
            });
        }

        const response = await api.createRequest()
            .addEndpoint("/create-checkout-session")
            .addMethod("POST")
            .addBody({lookup_key: lookupKey})
            .build();

        if (!response)
            throw new AppError("No data received from server", {code: "NO_DATA"});

        return response;
    }

    /**
     * @param {import("../../Server/API.js").API} api
     * @returns {Promise<Object>} - Object containing URL of the customer portal session: { url: string }
     */
    async manageSubscription(api) {
        const response = await api.createRequest()
            .addEndpoint("/create-portal-session")
            .addMethod("POST")
            .build();

        if (!response)
            throw new AppError("No data received from server", {code: "NO_DATA"});

        return response;
    }
}
