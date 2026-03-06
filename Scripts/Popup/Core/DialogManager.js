import {AppError} from "../../ErrorHandling/Helpers/AppError.js"
import {DialogHelper} from "../Helpers/DialogHelper.js";

export class DialogManager {
    constructor() {
        this.dialogElements = {
            overlay: document.getElementById("dialogOverlay"),
            header: document.getElementById("dialogHeader"),
            body: document.getElementById("dialogBody"),
            input: document.getElementById("dialogInput"),
            buttons: document.getElementById("dialogButtons"),
            info: document.getElementById("dialogInfo")
        };

        this.#validateElements();

        this.handler = null;
    }

    #validateElements() {
        const missing = Object.entries(this.dialogElements)
            .filter(([, element]) => !element)
            .map(([key]) => key);

        if (missing.length > 0) {
            throw new AppError("Missing dialog DOM elements.", {
                code: "DIALOG_ELEMENTS_MISSING",
                meta: {missing}
            });
        }
    }

    #resetDialog() {
        this.dialogElements.header.textContent = "";
        this.dialogElements.body.textContent = "";

        this.dialogElements.input.classList.add("hidden");
        this.dialogElements.buttons.classList.add("hidden");
        this.dialogElements.info.classList.add("hidden");
    }

    #showBase() {
        this.dialogElements.overlay.style.opacity = "0";
        this.dialogElements.overlay.classList.remove("hidden");
        setTimeout(() => {
            this.dialogElements.overlay.style.opacity = "1";
        }, 300);

        // Prevent inputs
        document.body.style.pointerEvents = "none";
    }

    #hideBase() {
        setTimeout(() => {
            this.dialogElements.overlay.style.opacity = "0";
        }, 300); // slight delay to avoid flicker
        this.dialogElements.overlay.classList.add("hidden");
        document.body.style.removeProperty("pointer-events");
    }


    addTitle(title) {
        this.dialogElements.header.textContent = title;

        return this;
    }

    addMessage(message) {
        this.dialogElements.body.textContent = message;

        return this;
    }

    addType(type) {
        switch (type) {
            case "Input":
                this.handler = () => DialogHelper.showInputDialog(this.dialogElements);
                break;
            case "Confirm":
                this.handler = () => DialogHelper.showConfirmDialog(this.dialogElements);
                break;
            case "Info":
                this.handler = () => DialogHelper.showInfoDialog(this.dialogElements);
                break;
            default:
                throw new AppError("Unsupported dialog type: " + type);
        }

        return this;
    }

    async show() {
        this.#validateSettings();
        this.#showBase();
        try {
            return await this.handler();
        } catch (e) {
            throw new AppError("Dialog show failed", {
                code: "DIALOG_SHOW_FAILED",
                cause: e
            })
        } finally {
            this.#resetDialog()
            this.#hideBase()
        }
    }

    #validateSettings() {
        if (!this.dialogElements.header.textContent)
            throw new AppError("Dialog title is required.", {
                code: "DIALOG_ELEMENTS_MISSING"
            });
        if (this.dialogElements.body.textContent)
            throw new AppError("Dialog message is required.", {
                code: "DIALOG_ELEMENTS_MISSING"
            })
        if (!this.handler)
            throw new AppError("Dialog type is required.", {
                code: "DIALOG_ELEMENTS_MISSING"
            })

    }
}