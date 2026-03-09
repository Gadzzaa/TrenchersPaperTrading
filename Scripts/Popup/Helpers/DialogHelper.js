export class DialogHelper {
    static showInputDialog(dialogElements) {
        return new Promise(resolve => {
            dialogElements.inputField = document.getElementById("dialogTextInput");
            dialogElements.inputConfirmButton =
                document.getElementById("inputConfirmButton");

            dialogElements.input.classList.remove("hidden");

            const onConfirm = () => {
                resolve(dialogElements.inputField.value);
                DialogHelper.#clearInputDialog(dialogElements, onConfirm);
            };
            dialogElements.inputConfirmButton.addEventListener("click", onConfirm);
        })
    }

    static showConfirmDialog(dialogElements) {
        return new Promise(resolve => {
            dialogElements.confirmButton = document.getElementById("dialogConfirmButton");
            dialogElements.cancelButton = document.getElementById("dialogCancelButton");

            dialogElements.buttons.classList.remove("hidden");

            const onConfirm = () => {
                resolve(true);
                DialogHelper.#clearConfirmDialog(dialogElements, onConfirm, onCancel);
            }
            const onCancel = () => {
                resolve(false);
                DialogHelper.#clearConfirmDialog(dialogElements, onConfirm, onCancel);
            }

            dialogElements.confirmButton.addEventListener("click", onConfirm);
            dialogElements.cancelButton.addEventListener("click", onCancel);
        })
    }

    static showInfoDialog(dialogElements) {
        return new Promise(resolve => {
            dialogElements.okayButton = document.getElementById("dialogInfoButton");

            dialogElements.info.classList.remove("hidden");

            const onConfirm = () => {
                resolve();
                DialogHelper.#clearInfoDialog(dialogElements, onConfirm);
            }

            dialogElements.okayButton.addEventListener("click", onConfirm);
        })
    }

    static showBlockerDialog(dialogElements) {
        return new Promise(resolve => {
            dialogElements.noInternet = document.getElementById("dialogNoInternet");
            dialogElements.noInternet.classList.remove("hidden");

            const chromeListener = (message) => {
                if (message.origin !== "TrenchersPaperTrading") return;
                if (message.type !== "UP_TO_DATE") return;
                DialogHelper.#clearBlockerDialog(dialogElements, chromeListener);
                resolve();
            };

            chrome.runtime.onMessage.addListener(chromeListener);
        })
    }

    static #clearBlockerDialog(dialogElements, chromeListener) {
        dialogElements.noInternet.classList.add("hidden");
        chrome.runtime.onMessage.removeListener(chromeListener);
    }


    static #clearInputDialog(dialogElements, onConfirm) {
        dialogElements.input.classList.add("hidden");
        dialogElements.inputConfirmButton.removeEventListener("click", onConfirm);
        dialogElements.inputField.value = "";
    }

    static #clearConfirmDialog(dialogElements, onConfirm, onCancel) {
        dialogElements.buttons.classList.add("hidden");
        dialogElements.confirmButton.removeEventListener("click", onConfirm);
        dialogElements.cancelButton.removeEventListener("click", onCancel);
    }

    static #clearInfoDialog(dialogElements, onConfirm) {
        dialogElements.info.classList.add("hidden");
        dialogElements.okayButton.removeEventListener("click", onConfirm);
    }
}
