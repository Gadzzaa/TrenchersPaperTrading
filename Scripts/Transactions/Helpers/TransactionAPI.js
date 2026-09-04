import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class TransactionAPI {
    /**
     * @param {Object} payload - Contains transaction details.
     * @param {API} api - API class to manage calls
     * @returns {Promise<Object>} - Response object with the following structure:
     * {
     *   success: boolean,
     *   tokensReceived: number,
     *   solSpent: number,
     *   effectivePrice: number,
     *   pnlData: Object,
     *   tokenData: Object
     * }
     */
    async buy(payload, api) {
        const response = await api.createRequest()
            .addEndpoint("/buy")
            .addMethod("POST")
            .addBody(payload)
            .build();

        if (!response?.success)
            throw new AppError(response.error || "Unknown error occured.", {
                code: "BUY_FAILED",
                meta: {
                    payload,
                    response,
                },
            });

        return response;
    }

    /**
     * @param {Object} payload - Contains transaction details.
     * @param {API} api - API class to manage calls
     * @returns {Promise<Object>} - Response object with the following structure:
     * {
     *  success: boolean,
     *  solReceived: number,
     *  tokensSold: number,
     *  effectivePrice: number
     * }
     */
    async sell(payload, api) {
        const response = await api.createRequest()
            .addEndpoint("/sell")
            .addMethod("POST")
            .addBody(payload)
            .build();

        if (!response?.success)
            throw new AppError(response.error || "Unknown error occured.", {
                code: "SELL_FAILED",
                meta: {
                    payload,
                    response,
                },
            });

        return response;
    }

    /**
     * @param {API} api - API class to manage calls
     * @returns {Promise<Object>} - Object containing user's portfolio data.
     */
    async getPortfolio(api) {
        const response = await api.createRequest()
            .addEndpoint("/portfolio")
            .addMethod("GET")
            .addRetries()
            .build();

        if (!response)
            throw new AppError("No data received from server.", {
                code: "NO_DATA",
                meta: {response},
            });

        return response;
    }
}
