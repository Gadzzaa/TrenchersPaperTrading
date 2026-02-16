import { TransactionManager } from "../../Transactions/Core/TransactionManager.js";
import { UIHelper } from "../Helpers/UIHelper.js";
import { updateBalanceUI } from "../Helpers/BalanceUpdater.js";
import { ErrorHandler } from "../../ErrorHandling/Core/ErrorHandler.js";
import { AppError } from "../../ErrorHandling/Helper/AppError.js";

export async function handleActions(button, stateManager) {
  try {
    if (document.body.classList.contains("edit-mode")) return;
    UIHelper.disableAllTradeButtons();
    // Implement the startLoadingDots functionality here

    let Constants = {
      transactionManager: null,
      poolAddress: null,
      action: null,
      dataAmount: null,
      button: button,
    };

    loadConstants(Constants, stateManager);

    if (Constants.action === "buy")
      await handleBuy(
        Constants.transactionManager,
        Constants.poolAddress,
        stateManager,
      );
    if (Constants.action === "sell")
      await handleSell(Constants.transactionManager, stateManager);
  } catch (error) {
    ErrorHandler.show(error);
  } finally {
    await updateBalanceUI(true);
    // Implement the stopLoadingDots functionality here
    UIHelper.enableAllTradeButtons();
  }
}

function loadConstants(Constants, stateManager) {
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

async function handleBuy(transactionManager, poolAddress, stateManager) {
  const result = await transactionManager.buyToken();
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

  let solSpent = parseFloat(result.solSpent.toFixed(2));
  showNotification(
    `You bought ${solSpent} SOL worth of ${result.tokenData.symbol}!`,
    "success",
  );
  await importTradeLog(stateManager.variables);
  setActiveToken(poolAddress);
}

async function handleSell(transactionManager, stateManager) {
  const result = await transactionManager.sellToken();
  if (!result?.success)
    throw new AppError(result.error || "Unknown error occurred.", {
      code: "SELL_FAILED",
      meta: {
        transactionResult: result,
        transactionManager,
        stateManager,
      },
    });

  const solReceived = parseFloat(result.solReceived).toFixed(2);
  showNotification(`You sold for ${solReceived} SOL!`, "success");
  await importTradeLog(stateManager.variables);
}
