import {ChromeHandler} from "../ChromeHandler.js";

const AUTH_NOTIFICATION_TYPES = new Set([
    "NO_SESSION_UI",
    "SESSION_VALID_UI",
]);

/**
 * Validates and accepts an authentication notification.
 *
 * @param {Object} message
 * @param {chrome.runtime.MessageSender} sender
 * @param {import("./API.js").API} api
 * @returns {boolean}
 */
export function acceptAuthNotification(
    message,
    sender,
    api
) {
    if (
        message?.origin !== "TrenchersPaperTrading" ||
        !AUTH_NOTIFICATION_TYPES.has(message?.type) ||
        !ChromeHandler.isTrustedInternalSender(sender)
    ) {
        return false;
    }

    return api.acceptWorkerRevision(
        message?.payload?.workerRevision
    );
}