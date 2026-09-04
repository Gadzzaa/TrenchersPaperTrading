import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class SubscriptionAPI {
    /**
     * @param {string} type - "monthly" or "yearly".
     * @param {API} api - API class to manage calls
     * @returns {Promise<Object>} - Object containing URL of the checkout session: { url: string }
     */
    async upgradeSubscription(type, api) {
        let lookup_key;
        if (type === "monthly") lookup_key = "pro_monthly";
        else lookup_key = "pro_yearly";

        const response = await api.createRequest()
            .addEndpoint("/create-checkout-session")
            .addMethod("POST")
            .addBody({lookup_key})
            .build();

        if (!response)
            throw new AppError("No data received from server", {code: "NO_DATA"});

        return response;
    }

    /**
     * @param {API} api - API class to manage calls
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
