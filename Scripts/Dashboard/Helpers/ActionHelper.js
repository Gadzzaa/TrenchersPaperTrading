import { TransactionManager } from "../../Transactions/Core/TransactionManager.js";
import { AppError } from "../../ErrorHandling/Helpers/AppError.js";
import { NotificationManager } from "../../Utils/Core/NotificationManager.js";

export class ActionHelper {
  static async handleBuy(transactionManager, poolAddress, stateManager) {
    const result = await transactionManager.buyToken(stateManager);
    if (!result?.success)
      throw new AppError(result.error || "Unknown error occurred.", {
        code: "BUY_FAILED",
        meta: {
          transactionResult: result,
          transactionManager,
          poolAddress,
          stateManager,
        },
      });

    ActionHelper.confirmAction("buy", result.solSpent, result.tokenData.symbol);

    await stateManager.pnlService.syncTradeLog(stateManager.variables);
    stateManager.pnlService.setActiveToken(poolAddress);
  }

  static async handleSell(transactionManager, stateManager) {
    const result = await transactionManager.sellToken(stateManager);
    if (!result?.success)
      throw new AppError(result.error || "Unknown error occurred.", {
        code: "SELL_FAILED",
        meta: {
          transactionResult: result,
          transactionManager,
          stateManager,
        },
      });

    ActionHelper.confirmAction("sell", result.solReceived);

    await stateManager.pnlService.syncTradeLog(stateManager.variables);
  }

  confirmAction(action, amount, symbol = "") {
    amount = parseFloat(amount).toFixed(2);
    let notifMessage =
      action === "buy"
        ? `You bought ${solSpent} SOL worth of ${symbol}!`
        : `You sold for ${solReceived} SOL!`;

    NotificationManager.addType("success")
      .addMessage(notifMessage)
      .addSound()
      .build();
  }

  static loadAndValidateBasicConstants(Constants, stateManager) {
    Constants.poolAddress = stateManager.currentContract;
    Constants.action = Constants.button.dataset.action;
    Constants.dataAmount = parseFloat(Constants.button.dataset.amount);

    let error = false,
      errMsg = "";

    if (!Constants.poolAddress) {
      errMsg += "No pool address found. \n";
      error = true;
    }
    if (!Constants.action) {
      errMsg += "No action specified inside the button. \n";
      error = true;
    }
    if (!Constants.dataAmount) {
      errMsg += "No amount specified inside the button. \n";
      error = true;
    }
    if (error)
      throw new AppError(errMsg, {
        code: "INVALID_DATA",
        meta: {
          Constants,
        },
      });

    Constants.transactionManager = new TransactionManager(
      { poolAddress: Constants.poolAddress, amount: Constants.dataAmount },
      stateManager.variables,
    );
  }
}
