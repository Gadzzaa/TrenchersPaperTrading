export class Variables {
    #username = "";
    #balance = null;
    #sessionToken = null;

    /**
     * @param {Object} params
     * @param {string?} params.username
     * @param {number?} params.balance
     * @param {string?} params.sessionToken
     */
    constructor({username, balance, sessionToken} = {}) {
        username && (this.#username = username);
        balance && (this.#balance = balance);
        sessionToken && (this.#sessionToken = sessionToken);
    }

    /**
     * @param {string | null} sessionToken
     */
    setSessionToken(sessionToken) {
        this.#sessionToken = sessionToken;
    }

    /**
     * @returns {{username: string}} username, password
     */
    getCredentials() {
        return {username: this.#username};
    }

    /**
     * @returns {number|null} balance
     */
    getBalance() {
        return this.#balance;
    }

    /**
     * @returns {string|null} sessionToken
     */
    getSessionToken() {
        return this.#sessionToken;
    }
}
