export class PoolWatcher {
    /**
     * @param {WebsocketManager} websocket
     */
    constructor(websocket) {
        this.ws = websocket;
        this.watchedPools = new Map();
    }

    /**
     * @param {any} poolAddress
     * @returns {string}
     */
    #normalizePoolAddress(poolAddress) {
        return String(poolAddress?.toString?.() ?? poolAddress ?? "");
    }

    /**
     * Starts watching a pool through websocket.
     * @param {string} poolAddress
     * @param {any} pnlData
     */
    watch(poolAddress, pnlData) {
        const normalizedPoolAddress = this.#normalizePoolAddress(poolAddress);
        if (!normalizedPoolAddress) return;

        if (!this.watchedPools.has(normalizedPoolAddress)) {
            this.watchedPools.set(normalizedPoolAddress, {price: null, liquidity: null});
        }

        this.ws.send({type: "watchPool", poolAddress: normalizedPoolAddress, poolData: pnlData});
    }

    /**
     * Stops watching a pool.
     * @param {string} poolAddress
     */
    unwatch(poolAddress) {
        const normalizedPoolAddress = this.#normalizePoolAddress(poolAddress);
        if (!normalizedPoolAddress || !this.watchedPools.has(normalizedPoolAddress)) return;

        this.ws.send({type: "unwatchPool", poolAddress: normalizedPoolAddress});
        this.watchedPools.delete(normalizedPoolAddress);
    }

    /**
     * Applies incoming pool update data.
     * @param {{poolAddress: string, price: number, liquidity: number}} data
     */
    updatePool(data) {
        const normalizedPoolAddress = this.#normalizePoolAddress(data?.poolAddress);
        const pool = this.watchedPools.get(normalizedPoolAddress);

        if (pool) {
            pool.price = data.price;
            pool.liquidity = data.liquidity;
        } else {
            this.unwatch(normalizedPoolAddress);
        }
    }

    /**
     * Returns cached data for a watched pool.
     * @param {string} poolAddress
     * @returns {{price: number|null, liquidity: number|null}|undefined}
     */
    get(poolAddress) {
        return this.watchedPools.get(this.#normalizePoolAddress(poolAddress));
    }

    /**
     * Clears all watched pools.
     */
    clear() {
        this.watchedPools.clear();
    }
}
