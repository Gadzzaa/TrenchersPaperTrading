import {TransactionAPI} from "../Helpers/TransactionAPI.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class TransactionManager {
    #poolAddress;
    #amount = 0;
    #slippagePercentage = 0;
    #feeAmount = 0;
    #authToken;

    /**
     * @param {Object} tokenData - Contains token transaction details.
     * {
     *    poolAddress: string,
     *    amount: number,
     *    slippagePercentage: number,
     *    feeAmount: number
     * }
     * @param {Variables} variables - Contains session and user variables.
     */
    constructor(tokenData = {}, variables) {
        tokenData.poolAddress && (this.#poolAddress = tokenData.poolAddress);
        tokenData.amount && (this.#amount = tokenData.amount);
        tokenData.slippagePercentage &&
        (this.#slippagePercentage = tokenData.slippagePercentage);
        tokenData.feeAmount && (this.#feeAmount = tokenData.feeAmount);

        this.api = new TransactionAPI();
        this.variables = variables;

        this.#authToken = this.variables.getAuthToken();
        if (this.#authToken == null)
            throw ErrorHandler.log(new AppError("User is not authenticated."), {
                code: "INVALID_TOKEN",
            });
    }

    /**
     *  @returns {Promise<Object>} - Response object with the following structure:
     *  {
     *    success: boolean,
     *    tokensReceived: number,
     *    solSpent: number,
     *    effectivePrice: number,
     *    tokenData: Object
     *  }
     * */
    async buyToken(stateManager) {
        try {
            const payload = {
                poolAddress: this.#poolAddress,
                solAmount: this.#amount,
                slippage: this.#slippagePercentage,
                fee: this.#feeAmount,
            };
            let authToken = this.#authToken;

            if (!authToken)
                throw new AppError("Authorization token is required for transactions.", {
                    code: "INVALID_TOKEN",
                });
            const response = await this.api.buy(payload, authToken);
            const activePoolAddress = response.poolAddress || this.#poolAddress;

            if (activePoolAddress !== this.#poolAddress) {
                stateManager.pnlService.pnlDataManager.replacePoolAddress(
                    this.#poolAddress,
                    activePoolAddress,
                    response.pnlData,
                );
                // Subscribe first. WebSocket messages are ordered, so the
                // subsequent unwatch removes only the old alias without ever
                // leaving the live pool unsubscribed during the handoff.
                stateManager.pnlService.poolWatcher.watch(activePoolAddress, response.pnlData);
                stateManager.pnlService.poolWatcher.unwatch(this.#poolAddress);
                this.#poolAddress = activePoolAddress;
            } else {
                stateManager.pnlService.pnlDataManager.add(activePoolAddress, response.pnlData);
            }

            await stateManager.pnlService.syncTradeLog(stateManager.variables)

            stateManager.pnlService.setActiveToken(activePoolAddress);
            stateManager.pnlService.update(true)

            return {
                success: response.success,
                tokensReceived: response.tokensReceived,
                solSpent: response.solSpent,
                effectivePrice: response.effectivePrice,
                tokenData: response.tokenData,
            };
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    /**
     *  @returns {Promise<Object>} - Response object with the following structure:
     *  {
     *    success: boolean,
     *    solReceived: number,
     *    tokensSold: number,
     *    effectivePrice: number
     *  }
     * */
    async sellToken(stateManager) {
        try {
            const payload = {
                poolAddress: this.#poolAddress,
                sellPercentage: this.#amount,
                slippage: this.#slippagePercentage,
                fee: this.#feeAmount,
            };

            const response = await this.api.sell(payload, this.#authToken);
            const activePoolAddress = response.poolAddress || this.#poolAddress;

            await stateManager.pnlService.syncTradeLog(stateManager.variables)

            if (this.#amount === 100)
                stateManager.pnlService.poolWatcher.unwatch(activePoolAddress);

            if (activePoolAddress !== this.#poolAddress) {
                stateManager.pnlService.poolWatcher.watch(
                    activePoolAddress,
                    stateManager.pnlService.pnlDataManager.get(activePoolAddress),
                );
                stateManager.pnlService.poolWatcher.unwatch(this.#poolAddress);
                this.#poolAddress = activePoolAddress;
                stateManager.pnlService.setActiveToken(activePoolAddress);
            }

            stateManager.pnlService.update(true)

            return {
                success: response.success,
                solReceived: response.solReceived,
                tokensSold: response.tokensSold,
                effectivePrice: response.effectivePrice,
            };
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    /**
     * @returns {Promise<Object>} - Object containing user's portfolio data.
     * */
    async getPortfolio() {
        try {
            return await this.api.getPortfolio(this.#authToken);
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }
}
