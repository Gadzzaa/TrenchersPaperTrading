import {TransactionManager} from "../../Transactions/Core/TransactionManager.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {NotificationManager} from "../../Utils/Core/NotificationManager.js";
import {StateManager} from "../Services/StateManager.js";

export class ActionHelper {
    /**
     * Executes buy transaction flow.
     * @param {TransactionManager} transactionManager
     * @param {StateManager} stateManager
     * @returns {Promise<void>}
     */
    static async handleBuy(transactionManager, stateManager) {
        const result = await transactionManager.buyToken(stateManager);

        ActionHelper.confirmAction("buy", result.solSpent, result.tokenData.symbol);
    }

    /**
     * Executes sell transaction flow.
     * @param {TransactionManager} transactionManager
     * @param {StateManager} stateManager
     * @returns {Promise<void>}
     */
    static async handleSell(transactionManager, stateManager) {
        const result = await transactionManager.sellToken(stateManager);

        ActionHelper.confirmAction("sell", result.solReceived);
    }

    /**
     * Shows success notification for trade action.
     * @param {"buy"|"sell"} action
     * @param {number|string} amount
     * @param {string} [symbol]
     */
    static confirmAction(action, amount, symbol = "") {
        amount = parseFloat(amount).toFixed(2);
        let notifMessage =
            action === "buy"
                ? `You bought ${amount} SOL worth of ${symbol}!`
                : `You sold for ${amount} SOL!`;

        new NotificationManager().addType("success")
            .addMessage(notifMessage)
            .addSound()
            .build();
    }

    /**
     * Loads and validates required constants for trade action execution.
     * @param {HTMLButtonElement} button
     * @param {StateManager} stateManager
     */
    static createTransactionContext(button, stateManager) {
        const poolAddress = stateManager.currentContract;
        const action = button.dataset.action;
        const amount = Number(button.dataset.amount);
        const errors = [];

        if (!poolAddress)
            errors.push("No pool address found.");

        if (!["buy", "sell"].includes(action))
            errors.push("Invalid transaction action.");

        if (!Number.isFinite(amount) || amount <= 0)
            errors.push("Invalid transaction amount.");

        if (errors.length > 0) {
            throw new AppError(errors.join("\n"), {
                code: "INVALID_DATA",
                meta: {poolAddress, action, amount},
            });
        }

        return {
            action,
            transactionManager: new TransactionManager(
                {poolAddress, amount},
                stateManager,
            ),
        };
    }
}
