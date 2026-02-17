export class PNLDataManager {
  constructor() {
    this.pnlDataArray = [];
  }

  #doesExist(poolAddress) {
    return this.get(poolAddress) !== null;
  }

  loadFromStorage() {
    let array = localStorage.getItem("pnlDataArray");
    this.set(array);
  }

  add(poolAddress, pnlData) {
    if (this.#doesExist(poolAddress)) {
      console.warn(`PnL data for pool ${poolAddress} already exists.`);
      return;
    }
    pnlDataArray.push({ poolAddress, ...pnlData });
    localStorage.setItem("pnlDataArray", JSON.stringify(pnlDataArray));
  }

  get(poolAddress) {
    return this.pnlDataArray.find(
      (p) => p.poolAddress.toString() === poolAddress.toString(),
    );
  }

  set(array) {
    pnlDataArray = array;
    localStorage.setItem("pnlDataArray", JSON.stringify(pnlDataArray));
  }

  getArray() {
    return this.pnlDataArray;
  }
}
