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
     * Moves locally persisted PnL metadata to a migrated pool address.
     * If the destination already exists, its fresh metadata wins and the old
     * record is removed so one token cannot be watched under two pool keys.
     * @param {string} oldPoolAddress
     * @param {string} newPoolAddress
     * @param {Record<string, any>} pnlData
     */
    replacePoolAddress(oldPoolAddress, newPoolAddress, pnlData) {
        const oldKey = oldPoolAddress?.toString();
        const newKey = newPoolAddress?.toString();
        const oldIndex = this.pnlDataArray.findIndex((entry) => entry.poolAddress?.toString() === oldKey);
        const newIndex = this.pnlDataArray.findIndex((entry) => entry.poolAddress?.toString() === newKey);
        const nextEntry = {poolAddress: newPoolAddress, ...pnlData};

        if (newIndex >= 0) {
            this.pnlDataArray[newIndex] = {...this.pnlDataArray[newIndex], ...nextEntry};
            if (oldIndex >= 0 && oldIndex !== newIndex) this.pnlDataArray.splice(oldIndex, 1);
        } else if (oldIndex >= 0) {
            this.pnlDataArray[oldIndex] = {...this.pnlDataArray[oldIndex], ...nextEntry};
        } else {
            this.pnlDataArray.push(nextEntry);
        }

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
