import {DialogManager} from "../Core/DialogManager.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";

export class DialogsValidators {
    static async askStartupBalance(stateManager) {
        const input = await new DialogManager(stateManager)
            .addTitle("Startup Balance")
            .addMessage("Please enter the amount of SOL you want to start with (minimum 1 SOL, maximum 100 SOL):")
            .addType("Input")
            .show();

        if (input === null || input === undefined) return; // User canceled
        const amount = Number(input);

        if (!Number.isFinite(amount) || amount < 1 || amount > 100) {
            throw new AppError("Startup balance must be between 1 and 100 SOL.", {
                code: "INVALID_AMOUNT_INPUT",
                meta: {input, amount},
            });
        }

        return amount;
    }

    static askTOSAgreement(stateManager) {
        return DialogsValidators.#askConfirmation(
            stateManager,
            "TOS Agreement",
            "By registering, you agree to our Terms of Service and Privacy Policy.",
        )
    }

    static askResetConfirmation(stateManager) {
        return DialogsValidators.#askConfirmation(
            stateManager,
            "Reset Confirmation",
            "Are you sure you want to reset your account? This action cannot be undone.",
        )
    }

    static #askConfirmation(stateManager, title, message) {
        return new DialogManager(stateManager)
            .addTitle(title)
            .addMessage(message)
            .addType("Confirm")
            .show();
    }
}
