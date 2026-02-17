export class PositionManager {
  constructor() {
    this.openPositions = [];
    this.currentPool = null;
  }

  setPositions(positions) {
    this.openPositions.length = 0;
    this.openPositions = positions;
    localStorage.setItem("openPositions", JSON.stringify(openPositions));
  }

  setActive(poolAddress) {
    this.currentPool = poolAddress;
  }

  getPosition(poolAddress) {
    return this.openPositions.find(
      (p) => p.pool.toString() === poolAddress?.toString(),
    );
  }

  calculatePnlUI(currentPrice, posClosed) {
    const pos = this.getCurrentPosition();
    if (!pos) return null;

    let unrealized = 0;
    if (posClosed)
      unrealized = pos.quantityHeld * (currentPrice - pos.avgEntry);

    const totalPNL = pos.realizedPNL + unrealized;

    const percent =
      pos.totalSOLSpent > 0 ? (totalPNL / pos.totalSOLSpent) * 100 : 0;

    return { pos, totalPNL, percent, currentPrice };
  }

  clear() {
    currentPool = null;
    openPositions.length = 0;
  }
}
