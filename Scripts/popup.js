import {DataManager} from "./Account/Core/DataManager.js";
import {SettingsManager} from "./Account/Core/SettingsManager.js";

let variables;

let tokenListContainer,
    usernameText,
    accountUser,
    solBalance,
    accountId,
    accountResets,
    resetsWhenText,
    subscriptionType,
    subscriptionNextPayment,
    subscriptionPrice,
    subscriptionMethod,
    versionInfo,
    pnlData,
    nextPaymentText;
let isPremium = false;
let countdownResets = null;
const tokens = [];

async function init() {
    await loadAPIData();
}

function disconnectPopup() {
    countdownResets = null;
}

document.addEventListener("DOMContentLoaded", async () => {
    usernameText = document.getElementById("usernameText");
    solBalance = document.getElementById("solBalance");
    pnlData = document.getElementById("pnlData");
    accountUser = document.getElementById("username");
    tokenListContainer = document.getElementById("tokenList");
    accountId = document.getElementById("id");
    accountResets = document.getElementById("resets");
    resetsWhenText = document.getElementById("resetsWhenText");
    subscriptionType = document.getElementById("subscriptionType");
    nextPaymentText = document.getElementById("nextPaymentText");
    subscriptionNextPayment = document.getElementById("subscriptionStatus");
    subscriptionPrice = document.getElementById("price");
    subscriptionMethod = document.getElementById("method");
    versionInfo = document.getElementById("versionInfo");

    await init();
});

async function loadAPIData() {
    let dataManager = new DataManager(variables);
    let settingsManager = new SettingsManager(variables);
    tokenListContainer.innerHTML = "";
    tokens.length = 0;
    const popupData = await dataManager.fetchAccountData();
    console.log("Popup data received:", popupData);
    const {
        userId,
        username,
        resets,
        portfolio,
        subscriptionInfo,
        version,
        realizedPNL,
    } = popupData;
    let subscription = subscriptionInfo.subscription;
    isPremium = subscriptionInfo?.premium == true;
    if (!userId) throw new Error("No user ID returned from API");
    if (!username) throw new Error("No username returned from API");
    if (resets == null) throw new Error("No resets count returned from API");
    if (usernameText.textContent != username) usernameText.textContent = username;
    solBalance.textContent = `${portfolio.solBalance.toFixed(2)} SOL`;
    localStorage.setItem("cachedSolBalance", portfolio.solBalance.toFixed(2));
    localStorage.setItem("cachedSolBalanceTime", Date.now().toString());
    pnlData.textContent = `${realizedPNL >= 0 ? "+" : ""}${realizedPNL.toFixed(2)} SOL / 24h`;

    for (const [poolAddress, token] of Object.entries(portfolio.tokens)) {
        if (token.amount <= 0) continue;
        addToken(poolAddress, token.name, token.symbol, token.amount, token.image);
    }

    if (accountUser.textContent != username) accountUser.textContent = username;
    accountId.textContent = userId;
    accountResets.textContent = resets.resetsNumber + " / 5";
    console.log("Last reset:", resets.lastReset);
    subscriptionType.textContent = capitalize(subscription.status);
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
    subscriptionMethod.textContent = capitalize(subscription.paymentMethodType);
    versionInfo.textContent = version;

    //Settings
    try {
        const settings = await settingsManager.getSettings();
        applyPremiumSettings("saveWindowPos", settings.saveWindowPos, false);
        applyPremiumSettings(
            "pnlRefreshInterval",
            settings.pnlRefreshInterval,
            500,
        );

        console.log("Settings loaded:", settings);
    } catch (err) {
        console.warn("Using default settings due to error:", err);

        // Fallback to defaults if backend fails
        applyPremiumSettings("saveWindowPos", false);
        applyPremiumSettings("pnlRefreshInterval", 500);
    }

    startCountdown(resets.lastReset);
    applyPremiumUI(isPremium);
}

function capitalize(s) {
    return s && String(s[0]).toUpperCase() + String(s).slice(1);
}

function getTimeUntilNextReset(lastReset) {
    const last = new Date(lastReset);
    const next = new Date(last.getTime() + 24 * 60 * 60 * 1000); // +24h
    const now = new Date();
    let diffMs = next - now;
    if (diffMs < 0) diffMs = 0; // already passed

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {hours, minutes};
}

function startCountdown(lastReset) {
    function update() {
        const {hours, minutes} = getTimeUntilNextReset(lastReset);
        resetsWhenText.textContent = `(next refill in ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m)`;
    }

    update(); // initial call
    countdownResets = setInterval(update, 1000 * 5); // update every 5s
}


function addToken(
    poolAddress,
    name,
    symbol,
    amount,
    imagePath = "Images/solana-sol-logo.png",
) {
    const token = {
        poolAddress,
        name,
        symbol,
        amount,
        imagePath,
    };
    tokens.push(token);
    renderToken(token);
}

function renderToken(token) {
    const button = document.createElement("button");
    button.classList.add("tkn");

    const safeName = token.name;
    const safeSymbol = token.symbol;
    const safeAmount = convertToKMB(token.amount);
    const safeImagePath = token.imagePath;

    button.innerHTML = `
    <div class="tknImage">
      <img src="${safeImagePath}" class="tknImageFile" onerror="this.src='Images/solana-sol-logo.png'" />
    </div>
    <div class="tknInfo">
      <p class="tknName" style="overflow: hidden">${safeName}</p>
      <p class="tknValue">${safeAmount} ${safeSymbol}</p>
    </div>
    <p class="tknClickTxt">Click to open</p>
  `;

    button.addEventListener("click", () => {
        // Security: Validate poolAddress before opening URL
        const poolAddressPattern = /^[a-zA-Z0-9]+$/;
        if (poolAddressPattern.test(token.poolAddress)) {
            window.open(
                `https://axiom.trade/meme/${encodeURIComponent(token.poolAddress)}`,
                "_blank",
            );
        } else {
            console.error("Invalid pool address:", token.poolAddress);
        }
    });

    if (!tokenListContainer) console.error("Token list container not found.");
    tokenListContainer.appendChild(button);
}


function applyPremiumUI(isPremium) {
    const saveWindowBox = document.getElementById("saveWindowBox");
    const pnlSlider = document.getElementById("pnlSlider");

    if (!isPremium) {
        saveWindowBox.checked = false;
        saveWindowBox.disabled = true;
        pnlSlider.disabled = true;

        saveWindowBox.title = "Premium feature";
        pnlSlider.title = "Premium feature";
    } else {
        saveWindowBox.disabled = false;
        pnlSlider.disabled = false;
    }
}

function applyPremiumSettings(key, value, fallback) {
    if (value === undefined || value === null) {
        value = fallback;
    }

    switch (key) {
        case "saveWindowPos":
            value = Boolean(value);
            const checkbox = document.getElementById("saveWindowBox");
            if (checkbox) checkbox.checked = value;
            break;

        case "pnlRefreshInterval":
            value = Number(value);
            if (isNaN(value)) value = fallback;
            const slider = document.getElementById("pnlSlider");
            if (slider) slider.value = value / 100;
            break;
    }
}


function convertToKMB(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + "B";
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + "M";
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + "K";
    } else {
        return num.toFixed(2);
    }
}
