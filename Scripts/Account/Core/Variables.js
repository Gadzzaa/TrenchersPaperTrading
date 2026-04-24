export class Variables {
    #username = "";
    #balance = null;
    #authToken = null;

    /**
     * @param {Object} params
     * @param {string?} params.username
     * @param {number?} params.balance
     * @param {string?} params.authToken
     */
    constructor({username, balance, authToken} = {}) {
        username && (this.#username = username);
        balance && (this.#balance = balance);
        authToken && (this.#authToken = authToken);
    }

    /**
     * @param {string | null} authToken
     */
    setAuthToken(authToken) {
        this.#authToken = authToken;
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
     * @returns {string|null} authToken
     */
    getAuthToken() {
        return this.#authToken;
    }
}
