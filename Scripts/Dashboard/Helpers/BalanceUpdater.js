import { TransactionManager } from "../../Transactions/Core/TransactionManager.js";
import { ErrorHandler } from "../../ErrorHandling/Core/ErrorHandler.js";
import { AppError } from "../../ErrorHandling/Helpers/AppError.js";
export async function updateBalanceUI(force = false, stateManager) {
  let Constants = {
    transactionManager: null,
    solBalance: null,
    cache: null,
    lastUpdated: null,
    now: Date.now(),
    maxAge: 1000 * 60 * 5, // 5 mins
  };

  loadConstants(Constants, stateManager);

  // Try to get from cache
  if (
    !force &&
    Constants.cache &&
    Constants.now - Constants.lastUpdated < Constants.maxAge
  ) {
    Constants.solBalance.innerText = parseFloat(Constants.cache).toFixed(2);
    return;
  }

  // Fetch new balance from API
  console.log("Fetching new balance from API...");
  await fetchBalanceAPI(Constants.transactionManager, Constants.solBalance);
}

function loadConstants(Constants, stateManager) {
  Constants.transactionManager = new TransactionManager(
    {},
    stateManager.variables,
  );
  Constants.solBalance = document.getElementById("balanceValue");
  Constants.cache = localStorage.getItem("cachedBalance");
  Constants.lastUpdated = parseInt(
    localStorage.getItem("cachedBalanceTime") || "0",
    10,
  );
}

async function fetchBalanceAPI(transactionManager, solBalance) {
  const result = await transactionManager.getPortfolio();
  if (!result?.solBalance) {
    ErrorHandler.log(
      new AppError("Failed to fetch balance", {
        code: "INVALID_DATA",
        meta: { result },
      }),
    );
    return;
  }
  const balance = parseFloat(result.solBalance).toFixed(2);
  solBalance.innerText = balance;
  localStorage.setItem("cachedBalance", balance);
  localStorage.setItem("cachedBalanceTime", Date.now().toString());
}
