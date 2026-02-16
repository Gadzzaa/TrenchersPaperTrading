import { TransactionAPI } from "../Helpers/TransactionAPI.js";
import { ErrorHandler } from "../../ErrorHandling/Core/ErrorHandler.js";
import { AppError } from "../../ErrorHandling/Helper/AppError.js";
import { setPnlData, unwatchPool } from "../../pnlHandler.js";

export class TransactionManager {
  #poolAddress = null;
  #amount = 0;
  #slippagePercentage = 0;
  #feeAmount = 0;
  #sessionToken = null;

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
        meta: { sessionToken: this.#sessionToken },
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
  async buyToken() {
    try {
      const payload = {
        poolAddress: this.#poolAddress,
        solAmount: this.#amount,
        slippage: this.#slippagePercentage,
        fee: this.#feeAmount,
      };

      const response = await this.api.buy(payload, this.#sessionToken);

      setPnlData(this.#poolAddress, response.pnlData);

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
  async sellToken() {
    try {
      const tokenAmount = await this.#calculatePricePercentage(this.#amount);

      const payload = {
        poolAddress: this.#poolAddress,
        tokenAmount,
        slippage: this.#slippagePercentage,
        fee: this.#feeAmount,
      };

      const response = await this.api.sell(payload, this.#sessionToken);

      if (this.#amount === 100) unwatchPool(this.#poolAddress);

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
      const response = await this.api.getPortfolio(this.#sessionToken);
      return response;
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
        meta: { percentage, poolAddress: this.#poolAddress, portfolio },
      });

    const totalAmount = portfolio.tokens[this.#poolAddress].amount;
    if (!totalAmount)
      throw new AppError("No tokens found for this pool.", {
        code: "INVALID_AMOUNT",
        meta: { percentage, totalAmount, poolAddress: this.#poolAddress },
      });

    const amountToSell = parseFloat(totalAmount * (percentage / 100));
    if (amountToSell <= 0)
      throw new AppError("Calculated token amount is zero or negative.", {
        code: "INVALID_AMOUNT",
        meta: { percentage, totalAmount, poolAddress: this.#poolAddress },
      });

    return amountToSell;
  }
}
