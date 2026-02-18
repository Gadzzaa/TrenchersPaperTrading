import { AccountValidators } from "./AccountValidators.js";
import { BackendRequest } from "../../Server/BackendRequest.js";
import { AppError } from "../../ErrorHandling/Helpers/AppError.js";

export class AuthAPI {
  /**
   * @param {string} username - Username of the user.
   * @param {string} password - Password of the user.
   * @returns {Promise<string>} - Session token for the logged in account.
   */
  async login(username, password) {
    AccountValidators.loginValidator(username, password);

    const response = await new BackendRequest()
      .addEndpoint("/login")
      .addMethod("POST")
      .addBody(JSON.stringify({ username, password }))
      .build();

    if (!response?.token)
      throw new AppError("No token received from server: " + response.error, {
        code: "LOGIN_FAILED",
        meta: { username, response },
      });

    return response.token;
  }

  /**
   * @param {string} username - Username desired for registration.
   * @param {string} password - Password desired for registration.
   * @param {number} balance - Balance to start the account with.
   * @returns {Promise<string>} - Session token for the newly created account.
   */
  async register(username, password, balance) {
    AccountValidators.registerValidator(username, password, balance);

    const response = await new BackendRequest()
      .addEndpoint("/create-account")
      .addMethod("POST")
      .addBody(
        JSON.stringify({
          username,
          password,
          balance,
        }),
      )
      .addRetries(2)
      .build();

    if (!response?.token)
      throw new AppError("No token received from server: " + response.error, {
        code: "REGISTRATION_FAILED",
        meta: { username, balance, response },
      });

    return response.token;
  }

  /**
   * @param {string} sessionToken - Session token of the account to log out.
   * @returns {Promise<bool>} - Marking the success of the logout operation.
   */
  async logout(sessionToken) {
    await new BackendRequest()
      .addEndpoint("/logout")
      .addMethod("DELETE")
      .addAuthParams(sessionToken)
      .addRetries(2)
      .build();
    return true;
  }
}
