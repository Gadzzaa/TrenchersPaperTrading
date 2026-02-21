import { AppError } from "../../ErrorHandling/Helpers/AppError.js";
export class DialogsValidators {
  askStartupBalance() {
    let input = showDialog({
      title: "Startup Balance",
      message:
        "Please enter the amount of SOL you want to start with (minimum 1 SOL, maximum 100 SOL):",
      type: "Input",
    });

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

  askTOSAgreement() {
    let input = showDialog({
      title: "Register",
      message:
        "By registering, you agree to our Terms of Service and Privacy Policy.",
      type: "Confirm",
    });
    if (!input) return false;
    return true;
  }

  askResetConfirmation() {
    let input = showDialog({
      title: "Confirm Reset",
      message:
        "Are you sure you want to reset your account? This action cannot be undone.",
      type: "Confirm",
    });
    if (!input) return false;
    return true;
  }
}
