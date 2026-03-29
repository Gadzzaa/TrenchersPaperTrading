import {AppError} from "../Helpers/AppError.js";
import {ErrorHelper} from "../Helpers/ErrorHelper.js";
import {ErrorCodes} from "../Helpers/ErrorCodes.js";
import {NotificationManager} from "../../Utils/Core/NotificationManager.js";
import {DialogManager} from "../../Popup/Core/DialogManager.js"

export class ErrorHandler {
    /**
     * A safe message to show in UI (toast/banner).
     * @param {unknown} err
     * @returns {string}
     */
    static userMessage(err) {
        const e = ErrorHelper.normalize(err);
        return ErrorCodes.UserMessages[e.code] || ErrorCodes.UserMessages.UNKNOWN;
    }

    /**
     * Consistent console logging. Returns the normalized AppError for rethrowing.
     * @param {unknown} err
     * @param {Record<string, any>} [meta]
     * @returns {AppError}
     */
    static log(err, meta = {}) {
        const e = ErrorHelper.normalize(err, meta);
        console.error(`[${e.code}] ${e.message}`, {
            meta: e.meta,
            cause: e.cause,
            stack: e.stack,
        });
        return e;
    }

    /**
     * @param {unknown} err
     * @param {{ show?: boolean, sound?: boolean }} [notif]
     * @param {{ show?: boolean, stateManager?: StateManager}} [dialog] - Popup implementation of notif
     */
    static show(err, notif = {show: true, sound: true}, dialog = {show: false, stateManager: null}) {
        const normalizedError = ErrorHandler.log(err);
        if (notif.show) {
            const notification = new NotificationManager()
                .addType("error")
                .addMessage(ErrorHandler.userMessage(normalizedError));

            if (notif.sound) notification.addSound();

            notification.addError(normalizedError).build();
        }
        if (dialog.show) {
            if (!dialog.stateManager) console.error("No state manager provided for ErrorShow");
            new DialogManager(dialog.stateManager)
                .addTitle("An error occurred")
                .addMessage(ErrorHandler.userMessage(normalizedError))
                .addType("Info")
                .show();
            console.error("Error details:", normalizedError);
        }
    }
}
