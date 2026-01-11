export class Variables {
  #username = "";
  #password = "";
  #balance = null;
  #sessionToken = null;

  /**
   * @param {Object} params
   * @param {string} params.username
   * @param {string} params.password
   * @param {number} params.balance
   * @param {string} params.sessionToken
   */
  constructor({ username, password, balance, sessionToken } = {}) {
    username && (this.#username = username);
    password && (this.#password = password);
    balance && (this.#balance = balance);
    sessionToken && (this.#sessionToken = sessionToken);
  }

  /**
   * @param {string} username
   * @param {string} password
   */
  setCredentials(username, password) {
    this.#username = username;
    this.#password = password;
  }

  /**
   * @param {number} balance
   */
  setBalance(balance) {
    this.#balance = balance;
  }

  /**
   * @param {string} sessionToken
   */
  setSessionToken(sessionToken) {
    this.#sessionToken = sessionToken;
  }

  /**
   * @returns {string, string} username, password
   */
  getCredentials() {
    return { username: this.#username, password: this.#password };
  }

  /**
   * @returns {number} balance
   */
  getBalance() {
    return this.#balance;
  }

  /**
   * @returns {string} sessionToken
   */
  getSessionToken() {
    return this.#sessionToken;
  }
}
