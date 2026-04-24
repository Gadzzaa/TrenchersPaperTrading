export class AccountLoader {
    static defaultImagePath = "../../../Images/solana-sol-logo.png";

    static capitalize(s) {
        return s && String(s[0]).toUpperCase() + String(s).slice(1);
    }

    static startCountdown(lastReset, resetsWhenText) {
        function update() {
            const {hours, minutes} = AccountLoader.#getTimeUntilNextReset(lastReset);
            resetsWhenText.textContent = `(next refill in ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m)`;
        }

        update(); // initial call
        return setInterval(update, 1000 * 5); // update every 5s
    }

    static addToken(
        stateManager,
        poolAddress,
        name,
        symbol,
        amount,
        imagePath = AccountLoader.defaultImagePath,
    ) {
        const token = {
            poolAddress,
            name,
            symbol,
            amount,
            imagePath,
        };
        stateManager.tokens.push(token);
        AccountLoader.#renderToken(token);
    }

    static applyPremiumUI(isPremium) {
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

    static applyPremiumSetting(key, value, fallback) {
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


    static #getTimeUntilNextReset(lastReset) {
        const last = new Date(lastReset);
        const next = new Date(last.getTime() + 24 * 60 * 60 * 1000); // +24h
        const now = new Date();
        let diffMs = next - now;
        if (diffMs < 0) diffMs = 0; // already passed

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return {hours, minutes};
    }

    static #renderToken(token) {
        let tokenListContainer = document.getElementById("tokenList");

        const button = document.createElement("button");
        button.classList.add("tkn");

        const safeName = token.name;
        const safeSymbol = token.symbol;
        const safeAmount = AccountLoader.#convertToKMB(token.amount);
        const safeImagePath = (typeof token.imagePath === "string" && token.imagePath.trim()) ? token.imagePath : AccountLoader.defaultImagePath;

        const tknImage = document.createElement("div");
        tknImage.className = "tknImage";

        const img = document.createElement("img");
        img.className = "tknImageFile";
        img.src = safeImagePath;
        img.onerror = () => {
            img.onerror = null;
            img.src = AccountLoader.defaultImagePath;
        };
        tknImage.appendChild(img);

        const tknInfo = document.createElement("div");
        tknInfo.className = "tknInfo";

        const nameP = document.createElement("p");
        nameP.className = "tknName";
        nameP.style.overflow = "hidden";
        nameP.textContent = safeName;

        const valueP = document.createElement("p");
        valueP.className = "tknValue";
        valueP.textContent = `${safeAmount} ${safeSymbol}`;

        tknInfo.append(nameP, valueP);

        const clickTxt = document.createElement("p");
        clickTxt.className = "tknClickTxt";
        clickTxt.textContent = "Click to open";

        button.replaceChildren(tknImage, tknInfo, clickTxt);


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

        tokenListContainer.appendChild(button);
    }

    static #convertToKMB(num) {
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

}