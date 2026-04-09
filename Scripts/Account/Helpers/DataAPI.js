import {BackendRequest} from "../../Server/BackendRequest.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class DataAPI {
    /**
     * @param {string} sessionToken - Session token of the user.
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
    async getAccData(sessionToken) {
        const response = await new BackendRequest()
            .addEndpoint("/popupData")
            .addMethod("GET")
            .addAuthParams(sessionToken)
            .addRetries(2)
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
     * @param {string} sessionToken - Session token of the user.
     * @param {number} balance - Balance to reset the account to.
     * @returns {Promise<number>} - Resets left after the reset.
     */
    async resetAccount(sessionToken, balance) {
        const response = await new BackendRequest()
            .addEndpoint("/reset")
            .addMethod("PATCH")
            .addAuthParams(sessionToken)
            .addBody(JSON.stringify({amount: balance}))
            .addRetries(2)
            .build();

        if (response?.resetsLeft == null)
            throw new AppError("Resets not received from server", {
                code: "NO_DATA",
                meta: {response},
            });

        return response.resetsLeft;
    }

    /**
     * @param {string} sessionToken - Session token of the user.
     * @returns {Promise<boolean>} - Status of the session validity.
     */
    async checkSession(sessionToken) {
        try {
            const response = await new BackendRequest()
                .addEndpoint("/check-session")
                .addMethod("GET")
                .addAuthParams(sessionToken)
                .addRetries(0)
                .build();

            return Boolean(response.success);
        } catch (error) {
            const code = error?.code || error?.cause?.code || error?.meta?.json?.code;
            const authFailureCodes = new Set([
                "UNAUTHORIZED",
                "INVALID_SESSION",
                "AUTHORIZATION_TOKEN_REQUIRED",
            ]);
            if (authFailureCodes.has(code)) return false;
            throw error;
        }
    }

    /**
     * @param {string} sessionToken - Session token of the user.
     * @returns {Promise<Object>} - Object of trade log entries.
     */
    async getTradeLog(sessionToken) {
        const response = await new BackendRequest()
            .addEndpoint("/tradeLog")
            .addMethod("GET")
            .addAuthParams(sessionToken)
            .build();

        if (!response)
            throw new AppError("No trade log data received from server", {
                code: "NO_DATA",
                meta: {response},
            });

        return response;
    }
}
