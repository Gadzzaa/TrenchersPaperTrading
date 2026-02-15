import { BackendRequest } from "../../Server/BackendRequest.js";
import { AppError } from "../../ErrorHandling/Helper/AppError.js";

export class TransactionAPI {
  /**
   * @param {Object} payload - Contains transaction details.
   * @param {string} sessionToken - User session token for authentication.
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
  async buy(payload, sessionToken) {
    const response = await new BackendRequest()
      .addEndpoint("/buy")
      .addMethod("POST")
      .addAuthParams(sessionToken)
      .addBody(JSON.stringify(payload))
      .addRetries(2)
      .build();

    if (!response?.success)
      throw new AppError(response.error || "Unknown error occured.", {
        code: "BUY_FAILED",
        meta: {
          payload,
          sessionToken,
          response,
        },
      });

    return response;
  }

  /**
   * @param {Object} payload - Contains transaction details.
   * @param {string} sessionToken - User session token for authentication.
   * @returns {Promise<Object>} - Response object with the following structure:
   * {
   *  success: boolean,
   *  solReceived: number,
   *  tokensSold: number,
   *  effectivePrice: number
   * }
   */
  async sell(payload, sessionToken) {
    const response = await new BackendRequest()
      .addEndpoint("/sell")
      .addMethod("POST")
      .addAuthParams(sessionToken)
      .addBody(JSON.stringify(payload))
      .addRetries(2)
      .build();

    if (!response?.success)
      throw new AppError(response.error || "Unknown error occured.", {
        code: "SELL_FAILED",
        meta: {
          payload,
          sessionToken,
          response,
        },
      });

    return response;
  }

  /**
   * @param {string} sessionToken - User session token for authentication.
   * @returns {Promise<Object>} - Object containing user's portfolio data.
   */
  async getPortfolio(sessionToken) {
    const response = await new BackendRequest()
      .addEndpoint("/portfolio")
      .addMethod("GET")
      .addAuthParams(sessionToken)
      .build();

    if (!response)
      throw new AppError("No data received from server.", {
        code: "NO_DATA",
        meta: { response },
      });

    return response;
  }
}
