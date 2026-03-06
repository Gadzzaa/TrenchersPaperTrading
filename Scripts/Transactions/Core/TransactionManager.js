import {TransactionAPI} from "../Helpers/TransactionAPI.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class TransactionManager {
    #poolAddress;
    #amount = 0;
    #slippagePercentage = 0;
    #feeAmount = 0;
    #sessionToken;

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

        this.#sessionToken = this.variables.getSessionToken();
        if (this.#sessionToken == null)
            throw ErrorHandler.log(new AppError("User is not authenticated."), {
                code: "INVALID_TOKEN",
                meta: {sessionToken: this.#sessionToken},
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
            let sessionToken = this.#sessionToken;

            if (!sessionToken)
                throw new AppError("Session token is required for transactions.", {
                    code: "INVALID_TOKEN",
                    meta: {sessionToken},
                });
            const response = await this.api.buy(payload, sessionToken);


            stateManager.pnlService.pnlDataManager.add(
                this.#poolAddress,
                response.pnlData,
            );

            await stateManager.pnlService.syncTradeLog(stateManager.variables)

            stateManager.pnlService.setActiveToken(this.#poolAddress);
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
            const tokenAmount = await this.#calculatePricePercentage(this.#amount);

            const payload = {
                poolAddress: this.#poolAddress,
                tokenAmount,
                slippage: this.#slippagePercentage,
                fee: this.#feeAmount,
            };

            const response = await this.api.sell(payload, this.#sessionToken);

            await stateManager.pnlService.syncTradeLog(stateManager.variables)

            if (this.#amount === 100)
                stateManager.pnlService.poolWatcher.unwatch(this.#poolAddress);

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
            return await this.api.getPortfolio(this.#sessionToken);
        } catch (error) {
            throw ErrorHandler.log(error);
        }
    }

    /**
     * @param {number} percentage - Percentage of tokens to sell.
     * @returns {Promise<number>} - Amount of tokens to sell.
     */
    async #calculatePricePercentage(percentage) {
        let portfolio = await this.getPortfolio();
        if (!portfolio?.tokens)
            throw new AppError("Portfolio data is missing tokens information.", {
                code: "INVALID_PORTFOLIO",
                meta: {percentage, poolAddress: this.#poolAddress, portfolio},
            });

        const totalAmount = portfolio.tokens[this.#poolAddress].amount;
        if (!totalAmount)
            throw new AppError("No tokens found for this pool.", {
                code: "INVALID_AMOUNT",
                meta: {percentage, totalAmount, poolAddress: this.#poolAddress},
            });

        const amountToSell = parseFloat(totalAmount * (percentage / 100));
        if (amountToSell <= 0)
            throw new AppError("Calculated token amount is zero or negative.", {
                code: "INVALID_AMOUNT",
                meta: {percentage, totalAmount, poolAddress: this.#poolAddress},
            });

        return amountToSell;
    }
}
