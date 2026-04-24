export class PnlUIController {
    /**
     * Caches pnl-related DOM elements.
     */
    constructor() {
        this.boughtText = document.getElementById("boughtText");
        this.soldText = document.getElementById("soldText");
        this.holdText = document.getElementById("holdText");
        this.positionEl = document.getElementById("pnlText");
        this.sellsTab = document.getElementById("Sells");
    }

    /**
     * Validates and populates required DOM element references.
     * @param {Record<string, HTMLElement>} DOM_el
     */
    validateElements(DOM_el) {
        this.boughtText != null && (DOM_el.boughtText = this.boughtText);
        this.soldText != null && (DOM_el.soldText = this.soldText);
        this.holdText != null && (DOM_el.holdText = this.holdText);
        this.positionEl != null && (DOM_el.positionEl = this.positionEl);

        Object.entries(DOM_el).forEach(([key, value]) => {
            if (value == null) {
                throw new Error(`DOM element "${key}" is null or undefined`);
            }
        });
    }

    /**
     * Updates pnl values on the dashboard.
     * @param {{pos: any, totalPNL: number, percent: number, currentPrice: number}} data
     */
    update(data) {
        let DOM_el = {};
        this.validateElements(DOM_el);

        this.toggleSellsTab(data.pos.quantityHeld);

        DOM_el.positionEl.classList.remove("positive", "negative");
        DOM_el.positionEl.textContent = `${data.totalPNL.toFixed(2)} (${data.percent.toFixed(2)}%)`;
        DOM_el.positionEl.classList.add(
            data.totalPNL >= 0 ? "positive" : "negative",
        );

        DOM_el.boughtText.textContent = `${data.pos.totalSOLSpent.toFixed(2)}`;
        DOM_el.soldText.textContent = `${data.pos.amountSold.toFixed(2)} `;
        DOM_el.holdText.textContent = `${(data.pos.quantityHeld * data.currentPrice).toFixed(2)}`;
    }

    /**
     * Toggles visibility for sells tab based on held quantity.
     * @param {number} quantityHeld
     */
    toggleSellsTab(quantityHeld) {
        let sellsTab;
        this.sellsTab != null && (sellsTab = this.sellsTab);
        if (quantityHeld <= 0 && !document.body.classList.contains("edit-mode"))
            sellsTab.classList.add("hidden");
        else sellsTab.classList.remove("hidden");
    }

    /**
     * Resets pnl UI values to defaults.
     */
    clear() {
        let DOM_el = {};
        this.validateElements(DOM_el);

        Object.entries(DOM_el).forEach(([, value]) => {
            value.textContent = "0.00";
        });
        DOM_el.positionEl.classList.remove("positive", "negative");
        DOM_el.positionEl.textContent = "0.00 SOL (0.00%)";
    }
}
