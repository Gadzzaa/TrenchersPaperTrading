export class PositionManager {
    /**
     * Initializes active pool and open position state.
     */
    constructor() {
        this.openPositions = [];
        this.currentPool = null;
    }

    /**
     * Replaces open positions and persists them.
     * @param {any[]} positions
     */
    setPositions(positions) {
        this.openPositions.length = 0;
        this.openPositions = positions;
        localStorage.setItem("openPositions", JSON.stringify(this.openPositions));
    }

    /**
     * Sets the active pool being tracked.
     * @param {string} poolAddress
     */
    setActive(poolAddress) {
        this.currentPool = poolAddress;
    }

    /**
     * Returns a position by pool address.
     * @param {string} poolAddress
     * @returns {any}
     */
    getPosition(poolAddress) {
        return this.openPositions.find(
            (p) => p.pool.toString() === poolAddress?.toString(),
        );
    }

    /**
     * Computes ui-ready pnl metrics for the active position.
     * @param {number} currentPrice
     * @returns {{pos: any, totalPNL: number, percent: number, currentPrice: number}|null}
     */
    calculatePnlUI(currentPrice) {
        let pos, posClosed;

        pos = this.getPosition(this.currentPool);
        if (!pos) return null;

        posClosed = !!this.openPositions[pos];

        let unrealized = 0;
        if (!posClosed && currentPrice != null)
            unrealized = pos.quantityHeld * (currentPrice - pos.avgEntry);


        const totalPNL = pos.realizedPNL + unrealized;

        const percent =
            pos.totalSOLSpent > 0 ? (totalPNL / pos.totalSOLSpent) * 100 : 0;

        return {pos, totalPNL, percent, currentPrice};
    }

    /**
     * Clears all local position state.
     */
    clear() {
        this.currentPool = null;
        this.openPositions.length = 0;
    }
}
