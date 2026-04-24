import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {DialogHelper} from "../Helpers/DialogHelper.js"

export class DialogManager {
    #dialogElements;
    #type;
    #message;
    #handler;
    #neverResolve;

    constructor(stateManager) {
        this.stateManager = stateManager;

        this.#dialogElements = {
            blocker: document.getElementById("Blocker"),
            message: document.getElementById("blockerMessage"),
        };

        this.#type = null;
        this.#message = null;
        this.#handler = null;

        this.#neverResolve = false;
    }


    addMessage(message) {
        this.#message = message;
        return this;
    };

    addType(type) {
        this.#type = type;
        switch (type) {
            case "no-internet":
                this.#handler = () => DialogHelper.handleNoInternet()
                break;

            case "outdated":
                this.#neverResolve = true;
                break;

            case "no-session":
                this.#handler = () => DialogHelper.handleNoSession();
                break;
        }

        return this;
    }

    #cleanup() {
        this.#dialogElements.message.textContent = "";
        this.#neverResolve = false;
    }

    #showBase() {
        this.#dialogElements.blocker.style.opacity = "1";

        setTimeout(() => {
            this.#dialogElements.blocker.style.display = "flex";
        }, 300); // TODO: implement --anim time here
    }

    #hideBase() {
        setTimeout(() => {
            this.#dialogElements.blocker.style.opacity = "0";
        }, 300) // TODO: implement --anim time here

        this.#dialogElements.blocker.style.display = "none";

    }

    async show() {
        if (this.stateManager.activeDialog === this.#type) return {dontRestart: true};
        this.#validateElements();

        this.#validateSettings();
        this.#dialogElements.message.textContent = this.#message;
        this.stateManager.activeDialog = this.#type;
        console.log(this.#message, this.#dialogElements)

        this.#showBase();
        try {
            if (this.#neverResolve) return;
            return await this.#handler();
        } catch (e) {
            throw new AppError("Dialog show failed", {
                code: "DIALOG_SHOW_FAILED",
                cause: e
            })
        } finally {
            this.#hideBase();
            this.#cleanup();
            this.stateManager.activeDialog = null;
        }
    }

    #validateSettings() {
        let message = this.#message;
        if (typeof message !== "string")
            throw new AppError('Message element does not support text content.', {
                code: "DIALOG_ELEMENTS_MISSING",
                meta: {
                    message
                }
            });
    }

    #validateElements() {
        const missing = Object.entries(this.#dialogElements)
            .filter(([, element]) => !element)
            .map(([key]) => key);

        if (missing.length > 0) {
            throw new AppError("Missing dialog DOM elements.", {
                code: "DIALOG_ELEMENTS_MISSING",
                meta: {missing}
            });
        }
    }
}