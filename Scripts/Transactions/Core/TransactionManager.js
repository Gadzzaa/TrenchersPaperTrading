import {TransactionAPI} from "../Helpers/TransactionAPI.js";

export class TransactionManager {
    #poolAddress;
    #amount;
    #slippagePercentage;
    #feeAmount;

    /**
     * @param {Object} tokenData - Contains token transaction details.
     * {
     *    poolAddress: string,
     *    amount: number,
     *    slippagePercentage: number,
     *    feeAmount: number
     * }
     * @param {StateManager} stateManager - Contains session and user variables.
     */
    constructor(
        {
            poolAddress,
            amount = 0,
            slippagePercentage = 0,
            feeAmount = 0,
        } = {},
        stateManager,
    ) {
        this.#poolAddress = poolAddress;
        this.#amount = amount;
        this.#slippagePercentage = slippagePercentage;
        this.#feeAmount = feeAmount;

        this.transactionAPI = new TransactionAPI();
        this.api = stateManager.api;
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
        const payload = this.#createTradePayload("solAmount")
        const response = await this.transactionAPI.buy(payload, this.api);
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

        await stateManager.pnlService.syncTradeLog()

        stateManager.pnlService.setActiveToken(activePoolAddress);
        stateManager.pnlService.update(true)

        return {
            success: response.success,
            tokensReceived: response.tokensReceived,
            solSpent: response.solSpent,
            effectivePrice: response.effectivePrice,
            tokenData: response.tokenData,
        };
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
        const payload = this.#createTradePayload("sellPercentage")

        const response = await this.transactionAPI.sell(payload, this.api);
        const activePoolAddress = response.poolAddress || this.#poolAddress;

        await stateManager.pnlService.syncTradeLog()

        if (this.#amount === 100)
            stateManager.pnlService.poolWatcher.unwatch(activePoolAddress);
        else {
            if (activePoolAddress !== this.#poolAddress) {
                stateManager.pnlService.poolWatcher.watch(
                    activePoolAddress,
                    stateManager.pnlService.pnlDataManager.get(activePoolAddress),
                );
                stateManager.pnlService.poolWatcher.unwatch(this.#poolAddress);
                this.#poolAddress = activePoolAddress;
                stateManager.pnlService.setActiveToken(activePoolAddress);
            }
        }
        stateManager.pnlService.update(true)

        return {
            success: response.success,
            solReceived: response.solReceived,
            tokensSold: response.tokensSold,
            effectivePrice: response.effectivePrice,
        };
    }

    /**
     * @returns {Promise<Object>} - Object containing user's portfolio data.
     * */
    getPortfolio() {
        return this.transactionAPI.getPortfolio(this.api);
    }

    /**
     * @param {"solAmount"|"sellPercentage"} amountField
     * @returns {Object}
     */
    #createTradePayload(amountField) {
        return {
            poolAddress: this.#poolAddress,
            [amountField]: this.#amount,
            slippage: this.#slippagePercentage,
            fee: this.#feeAmount,
        };
    }
}
