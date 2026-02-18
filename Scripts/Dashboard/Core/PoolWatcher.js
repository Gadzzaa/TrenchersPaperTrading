export class PoolWatcher {
  constructor(websocket) {
    this.ws = websocket;
    this.watchedPools = new Map();
  }

  watch(poolAddress, pnlData) {
    if (!this.watchedPools.has(poolAddress)) {
      this.watchedPools.set(poolAddress, { price: null, liquidity: null });
    }

    this.ws.send({ type: "watchPool", poolAddress, poolData: pnlData });
  }

  unwatch(poolAddress) {
    if (!this.watchedPools.has(poolAddress)) return;

    this.ws.send({ type: "unwatchPool", poolAddress });
    this.watchedPools.delete(poolAddress);
  }

  updatePool(data) {
    const pool = this.watchedPools.get(data.poolAddress);

    if (pool) {
      pool.price = data.price;
      pool.liquidity = data.liquidity;
    } else {
      this.unwatch(data.poolAddress);
    }
  }

  get(poolAddress) {
    return this.watchedPools.get(poolAddress);
  }

  clear() {
    this.watchedPools.clear();
  }
}
