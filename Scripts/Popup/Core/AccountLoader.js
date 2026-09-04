import {AccountUIHelper} from "../Helpers/AccountUIHelper.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {SettingsManager} from "../../Account/Core/SettingsManager.js";
import {DataManager} from "../../Account/Core/DataManager.js";

export class AccountLoader {
    static async loadData(stateManager) {
        let dataManager = new DataManager(stateManager);
        let data = await dataManager.fetchAccountData();
        stateManager.clearUI();
        AccountLoader.#validateData(data);
        AccountLoader.#loadMainPage(stateManager, data);
        AccountLoader.#loadAccountPage(stateManager, data);
        await AccountLoader.#loadSettings(stateManager);

        AccountUIHelper.applyPremiumUI(stateManager.isPremium);
    }

    static #validateData(data) {
        Object.entries(data).forEach(([key, value]) => {
            if (value == null)
                throw new AppError(`Missing value for key: ${key}`, {
                    code: "INVALID_API_RESPONSE",
                    meta: {
                        API: data,
                        key,
                        value,
                    }
                });
        })

    }

    static #loadMainPage(stateManager, data) {
        let usernameText = document.getElementById("usernameText");
        let solBalance = document.getElementById("solBalance");
        let pnlData = document.getElementById("pnlData");

        if (usernameText.textContent !== data.username) usernameText.textContent = data.username;

        solBalance.textContent = `${data.portfolio.solBalance.toFixed(2)} SOL`;
        localStorage.setItem("cachedSolBalance", data.portfolio.solBalance.toFixed(2));
        localStorage.setItem("cachedSolBalanceTime", Date.now().toString());

        pnlData.textContent = `${data.realizedPNL >= 0 ? "+" : ""}${data.realizedPNL.toFixed(2)} SOL / 24h`;

        for (const [poolAddress, token] of Object.entries(data.portfolio.tokens)) {
            if (token.amount <= 0) continue;
            AccountUIHelper.addToken(stateManager, poolAddress, token.name, token.symbol, token.amount, token.image);
        }
    }

    static #loadAccountPage(stateManager, data) {
        let accountUser = document.getElementById("username");
        let accountId = document.getElementById("id");
        let accountResets = document.getElementById("resets");
        let versionInfo = document.getElementById("versionInfo");
        let resetsWhenText = document.getElementById("resetsWhenText");

        if (accountUser.textContent !== data.username) accountUser.textContent = data.username;
        accountId.textContent = data.userId;
        AccountLoader.#loadSubscriptionInfo(stateManager, data);

        let maxResets = stateManager.isPremium ? 10 : 5;
        accountResets.textContent = data.resets.resetsNumber + " / " + maxResets;

        versionInfo.textContent = data.version;

        stateManager.resetsTimer = AccountUIHelper.startCountdown(data.resets.lastReset, resetsWhenText);
    }

    static #loadSubscriptionInfo(stateManager, data) {
        let subscriptionType = document.getElementById("subscriptionType");
        let nextPaymentText = document.getElementById("nextPaymentText");
        let subscriptionNextPayment = document.getElementById("subscriptionStatus");
        let subscriptionPrice = document.getElementById("price");
        let subscriptionMethod = document.getElementById("method");
        let upgradeButton = document.getElementById("upgradeButton");

        let subscription = data.subscriptionInfo.subscription;
        stateManager.isPremium = data.subscriptionInfo?.premium === true;

        subscriptionType.textContent = AccountUIHelper.capitalize(subscription.status);
        subscriptionNextPayment.textContent = "";
        if (subscription.currentPeriodEnd) {
            if (subscription.cancelAtPeriodEnd)
                nextPaymentText.textContent = "Expires: ";
            subscriptionNextPayment.textContent = new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }).format(new Date(subscription.currentPeriodEnd));
        }

        subscriptionPrice.textContent = `${subscription.currency}${parseFloat(subscription.price).toFixed(2)}`;
        subscriptionMethod.textContent = AccountUIHelper.capitalize(subscription.paymentMethodType);
        if (stateManager.isPremium) upgradeButton.classList.add("disabled");
        else upgradeButton.classList.remove("disabled");
    }

    static async #loadSettings(stateManager) {
        let settingsManager = new SettingsManager(stateManager);
        try {
            const settings = await settingsManager.getSettings();
            AccountUIHelper.applyPremiumSetting("saveWindowPos", settings.saveWindowPos, false);
            AccountUIHelper.applyPremiumSetting(
                "pnlRefreshInterval",
                settings.pnlRefreshInterval,
                500,
            );

            console.log("Settings loaded:", settings);
        } catch (err) {
            console.warn("Using default settings due to error:", err);

            // Fallback to defaults if backend fails
            AccountUIHelper.applyPremiumSetting("saveWindowPos", false);
            AccountUIHelper.applyPremiumSetting("pnlRefreshInterval", 500);
        }
    }

}