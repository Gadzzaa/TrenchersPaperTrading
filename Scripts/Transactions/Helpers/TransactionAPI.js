import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class TransactionAPI {
    /**
     * @param {Object} payload - Contains transaction details.
     * @param {import("../../Server/API.js").API} api
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
    buy(payload, api) {
        return this.#executeTrade("buy", payload, api);
    }

    /**
     * @param {Object} payload - Contains transaction details.
     * @param {import("../../Server/API.js").API} api
     * @returns {Promise<Object>} - Response object with the following structure:
     * {
     *  success: boolean,
     *  solReceived: number,
     *  tokensSold: number,
     *  effectivePrice: number
     * }
     */
    sell(payload, api) {
        return this.#executeTrade("sell", payload, api);
    }

    /**
     * @param {import("../../Server/API.js").API} api
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

    async #executeTrade(action, payload, api) {
        const response = await api.createRequest()
            .addEndpoint(`/${action}`)
            .addMethod("POST")
            .addBody(payload)
            .build();

        if (!response?.success) {
            throw new AppError(
                response?.error || "Unknown error occurred.",
                {
                    code: `${action.toUpperCase()}_FAILED`,
                    meta: {action, payload, response},
                }
            );
        }

        return response;
    }
}
