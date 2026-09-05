import {TransactionManager} from "../../Transactions/Core/TransactionManager.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {StateManager} from "../Services/StateManager.js";

const BALANCE_CACHE_MAX_AGE_MS = 5 * 60 * 1000;

/**
 * Updates displayed SOL balance with cache-first strategy.
 * @param {boolean} force
 * @param {StateManager} stateManager
 * @returns {Promise<void>}
 */
export async function updateBalanceUI(force = false, stateManager) {
    const transactionManager = new TransactionManager({}, stateManager);
    const balanceElement = document.getElementById("balanceValue");
    const cachedBalance = localStorage.getItem("cachedBalance");
    const lastUpdated = Number.parseInt(
        localStorage.getItem("cachedBalanceTime") || "0",
        10,
    );

    if (
        !force &&
        cachedBalance !== null &&
        Date.now() - lastUpdated < BALANCE_CACHE_MAX_AGE_MS
    ) {
        balanceElement.innerText = Number.parseFloat(cachedBalance).toFixed(2);
        return;
    }

    // Fetch new balance from API
    console.log("Fetching new balance from API...");
    await fetchBalanceAPI(transactionManager, balanceElement);
}

/**
 * Fetches latest balance and updates cache + DOM.
 * @param {TransactionManager} transactionManager
 * @param {HTMLElement} balanceElement
 * @returns {Promise<void>}
 */
async function fetchBalanceAPI(transactionManager, balanceElement) {
    const result = await transactionManager.getPortfolio();
    if (result?.solBalance == null) {
        ErrorHandler.log(
            new AppError("Failed to fetch balance", {
                code: "INVALID_DATA",
                meta: {result},
            }),
        );
        return;
    }
    const balance = parseFloat(result.solBalance).toFixed(2);
    balanceElement.innerText = balance;
    localStorage.setItem("cachedBalance", balance);
    localStorage.setItem("cachedBalanceTime", Date.now().toString());
}
