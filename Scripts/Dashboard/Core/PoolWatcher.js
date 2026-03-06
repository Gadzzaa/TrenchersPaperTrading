export class PoolWatcher {
    /**
     * @param {WebsocketManager} websocket
     */
    constructor(websocket) {
        this.ws = websocket;
        this.watchedPools = new Map();
    }

    /**
     * Starts watching a pool through websocket.
     * @param {string} poolAddress
     * @param {any} pnlData
     */
    watch(poolAddress, pnlData) {
        if (!this.watchedPools.has(poolAddress)) {
            this.watchedPools.set(poolAddress, {price: null, liquidity: null});
        }

        this.ws.send({type: "watchPool", poolAddress, poolData: pnlData});
    }

    /**
     * Stops watching a pool.
     * @param {string} poolAddress
     */
    unwatch(poolAddress) {
        if (!this.watchedPools.has(poolAddress)) return;

        this.ws.send({type: "unwatchPool", poolAddress});
        this.watchedPools.delete(poolAddress);
    }

    /**
     * Applies incoming pool update data.
     * @param {{poolAddress: string, price: number, liquidity: number}} data
     */
    updatePool(data) {
        const pool = this.watchedPools.get(data.poolAddress);

        if (pool) {
            pool.price = data.price;
            pool.liquidity = data.liquidity;
        } else {
            this.unwatch(data.poolAddress);
        }
    }

    /**
     * Returns cached data for a watched pool.
     * @param {string} poolAddress
     * @returns {{price: number|null, liquidity: number|null}|undefined}
     */
    get(poolAddress) {
        return this.watchedPools.get(poolAddress);
    }

    /**
     * Clears all watched pools.
     */
    clear() {
        this.watchedPools.clear();
    }
}
