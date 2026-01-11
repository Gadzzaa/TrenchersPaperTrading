import { BackendRequest } from "../../Server/BackendRequest.js";

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

    if (!response) throw new Error("No data received from server");

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
      .addBody(JSON.stringify({ amount: balance }))
      .addRetries(2)
      .build();

    if (!response.resetsLeft)
      throw new Error("resetsLeft not received from server");

    return response.resetsLeft;
  }

  /**
   * @param {string} sessionToken - Session token of the user.
   * @returns {Promise<boolean>} - Status of the session validity.
   */
  async checkSession(sessionToken) {
    const response = await new BackendRequest()
      .addEndpoint("/check-session")
      .addMethod("GET")
      .addAuthParams(sessionToken)
      .addRetries(2)
      .build();

    return response.success;
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

    if (!response) throw new Error("No trade log data received from server");

    return response;
  }
}
