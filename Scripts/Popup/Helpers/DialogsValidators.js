import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {DialogManager} from "../Core/DialogManager.js";

export class DialogsValidators {
    static async askStartupBalance(stateManager) {
        let input = await new DialogManager(stateManager)
            .addTitle("Startup Balance")
            .addMessage("Please enter the amount of SOL you want to start with (minimum 1 SOL, maximum 100 SOL):")
            .addType("Input")
            .show();

        if (input === null || input === undefined) return; // User canceled
        const amount = Number(input);
        if (isNaN(amount) || amount < 1 || amount > 100)
            throw new AppError(
                "Invalid amount. Please enter a valid number between 1 and 100.",
                {
                    code: "INVALID_AMOUNT_INPUT",
                    meta: {
                        input,
                        amount,
                    },
                },
            );

        return amount;
    }

    static async askTOSAgreement(stateManager) {
        return await new DialogManager(stateManager)
            .addTitle("TOS Agreement")
            .addMessage(
                "By registering, you agree to our Terms of Service and Privacy Policy.",
            )
            .addType("Confirm")
            .show();
    }

    static async askResetConfirmation(stateManager) {
        return await new DialogManager(stateManager)
            .addTitle("Reset Confirmation")
            .addMessage("Are you sure you want to reset your account? This action cannot be undone.")
            .addType("Confirm")
            .show();
    }
}
