export class PNLDataManager {
    /**
     * Initializes PnL cache container.
     */
    constructor() {
        this.pnlDataArray = [];
    }

    /**
     * Checks whether pnl data exists for the pool.
     * @param {string} poolAddress
     * @returns {boolean}
     */
    #doesExist(poolAddress) {
        return this.get(poolAddress) !== null;
    }

    /**
     * Loads cached pnl data from local storage.
     */
    loadFromStorage() {
        let array = localStorage.getItem("pnlDataArray");
        this.set(array);
    }

    /**
     * Adds new pnl data for a pool if not already present.
     * @param {string} poolAddress
     * @param {Record<string, any>} pnlData
     */
    add(poolAddress, pnlData) {
        if (this.#doesExist(poolAddress)) {
            console.warn(`PnL data for pool ${poolAddress} already exists.`);
            return;
        }
        this.pnlDataArray.push({poolAddress, ...pnlData});
        localStorage.setItem("pnlDataArray", JSON.stringify(this.pnlDataArray));
    }

    /**
     * Returns pnl data for a pool.
     * @param {string} poolAddress
     * @returns {any}
     */
    get(poolAddress) {
        return this.pnlDataArray.find(
            (p) => p.poolAddress.toString() === poolAddress.toString(),
        );
    }

    /**
     * Replaces full pnl data array and persists it.
     * @param {any[]} array
     */
    set(array) {
        this.pnlDataArray = array;
        localStorage.setItem("pnlDataArray", JSON.stringify(this.pnlDataArray));
    }

    /**
     * Returns all cached pnl records.
     * @returns {any[]}
     */
    getArray() {
        return this.pnlDataArray;
    }
}
