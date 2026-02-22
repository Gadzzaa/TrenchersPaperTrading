import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {DialogManager} from "../Core/DialogManager.js";

export class DialogsValidators {
    async static askStartupBalance() {
        let input = await new DialogManager()
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

    async static askTOSAgreement() {
        return await new DialogManager()
            .addTitle("TOS Agreement")
            .addMessage(
                "By registering, you agree to our Terms of Service and Privacy Policy.",
            )
            .addType("Confirm")
            .show();
    }

    async static askResetConfirmation() {
        return await new DialogManager()
            .addTitle("Reset Confirmation")
            .addMessage("Are you sure you want to reset your account? This action cannot be undone.")
            .addType("Confirm")
            .show();
    }
}
