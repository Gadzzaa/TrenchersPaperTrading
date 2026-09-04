import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {isAuthError} from "../../Server/AuthErrorHelper.js";

export class DataAPI {
    /**
     * @param {import("./API.js").API} api
     * @returns {Promise<Object>} - Array of account data:
     * {
     *  userId: number,
     *  username: string,
     *  resets: number,
     *  portfolio: Object,
     *  subscriptionInfo: Object,
     *  version: number,
     *  realizedPNL: number
     * }
     */
    async getAccData(api) {
        const response = await api.createRequest()
            .addEndpoint("/popupData")
            .addMethod("GET")
            .addRetries()
            .build();

        if (!response)
            throw new AppError("No data received from server", {
                code: "NO_DATA",
                meta: {
                    response,
                },
            });

        return response;
    }

    /**
     * @param {import("./API.js").API} api
     * @param {number} balance - Balance to reset the account to.
     * @returns {Promise<number>} - Resets left after the reset.
     */
    async resetAccount(api, balance) {
        const response = await api.createRequest()
            .addEndpoint("/reset")
            .addMethod("PATCH")
            .addBody({amount: balance})
            .build();

        if (response?.resetsLeft == null)
            throw new AppError("Resets not received from server", {
                code: "NO_DATA",
                meta: {response},
            });

        return response.resetsLeft;
    }

    /**
     * @param {import("./API.js").API} api
     * @returns {Promise<boolean>} - Status of the session validity.
     */
    async checkSession(api) {
        try {
            const response = await api.createRequest()
                .addEndpoint("/check-session")
                .addMethod("GET")
                .addRetries()
                .build();

            return Boolean(response.success);
        } catch (error) {
            if (isAuthError(error))
                return false;
            throw error;
        }
    }

    /**
     * @param {import("./API.js").API} api
     * @returns {Promise<Object>} - Object of trade log entries.
     */
    async getTradeLog(api) {
        const response = await api.createRequest()
            .addEndpoint("/tradeLog")
            .addMethod("GET")
            .addRetries()
            .build();

        if (!response)
            throw new AppError("No trade log data received from server", {
                code: "NO_DATA",
                meta: {response},
            });

        return response;
    }

    /**
     * @param {import("./API.js").API} api
     * @returns {Promise<Object>}
     */
    async getWebsocketLimits(api) {
        const response = await api.createRequest()
            .addEndpoint("/websocket-limits")
            .addMethod("GET")
            .addRetries()
            .build();

        if (!response)
            throw new AppError("No websocket limits received from server", {
                code: "NO_DATA",
                meta: {response}
            });
        return response;
    }
}
