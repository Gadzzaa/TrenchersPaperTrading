import {ServerStatus} from "./Server/ServerStatus.js";
import {ChromeHandler} from "./ChromeHandler.js";
import {AuthCoordinator} from "./Server/AuthCoordinator.js";
import {isValidWorkerRevision} from "./Server/AuthRevision.js";

const allowedAuthPages = new Set([
    chrome.runtime.getURL("dashboard.html"),
    chrome.runtime.getURL("popup.html")
])

function canPerformAuth(sender) {
    return (
        ChromeHandler.isTrustedInternalSender(sender) &&
        allowedAuthPages.has(sender.url)
    );
}

const Server = new ServerStatus();
const authCoordinator = new AuthCoordinator();

function server_listeners() {
    return (msg, _sender, sendResponse) => {
        if (msg.type === "HEALTH_PING") {
            Server.getStatus()
                .then((status) => {
                    sendResponse(status);
                    console.log("Health ping received. Status sent:", status);
                })
                .catch((error) => {
                    console.error("Health ping failed:", error);
                    sendResponse(false);
                });
            return true;
        }
        if (msg.type === "OUTDATED") {
            ChromeHandler.sendMessageAsync("OUTDATED_UI")
                .then((response) => {
                    sendResponse(response ?? {ok: true});
                })
                .catch((error) => {
                    console.error("OUTDATED handler failed:", error);
                    sendResponse({ok: false, error: error?.message || String(error)});
                });
            return true;
        }
    }
}

function user_listeners() {
    return (msg, _sender, sendResponse) => {
        if (msg.type === "NO_SESSION") {
            if (!canPerformAuth(_sender)) {
                sendErrorResponse(
                    sendResponse,
                    null,
                    "FORBIDDEN",
                    "This sender cannot change session state."
                );
                return;
            }

            authCoordinator
                .invalidate(msg.payload?.workerRevision)
                .then(({invalidated, workerRevision}) => {
                    sendResponse({
                        ok: true,
                        invalidated,
                        workerRevision,
                    });
                })
                .catch(error => {
                    sendErrorResponse(
                        sendResponse,
                        error,
                        "SESSION_INVALIDATION_FAILED",
                        "Could not invalidate session."
                    );
                });

            return true;
        }
        if (msg.type === "SESSION_VALID") {
            if (!canPerformAuth(_sender)) {
                sendErrorResponse(
                    sendResponse,
                    null,
                    "FORBIDDEN",
                    "This sender cannot change session state."
                );
                return;
            }

            const reportedRevision =
                msg.payload?.workerRevision;

            if (!isValidWorkerRevision(reportedRevision)) {
                sendErrorResponse(
                    sendResponse,
                    null,
                    "INVALID_WORKER_REVISION",
                    "Worker revision is missing or invalid."
                );
                return;
            }

            authCoordinator
                .getWorkerRevision()
                .then(currentRevision => {
                    if (reportedRevision !== currentRevision) {
                        sendResponse({
                            ok: true,
                            notified: false,
                            workerRevision: currentRevision,
                        });

                        return;
                    }

                    return ChromeHandler.sendMessageAsync(
                        "SESSION_VALID_UI",
                        {
                            workerRevision: reportedRevision,
                        }
                    ).then(response => {
                        sendResponse(
                            response ?? {
                                ok: true,
                                notified: true,
                                workerRevision: reportedRevision,
                            }
                        );
                    });
                })
                .catch(error => {
                    sendErrorResponse(
                        sendResponse,
                        error,
                        "SESSION_NOTIFICATION_FAILED",
                        "Could not notify session state."
                    );
                });
            return true;
        }
    }
}

function auth_listeners() {
    return (msg, _sender, sendResponse) => {
        if (msg.type === "AUTH_REFRESH") {
            if (!canPerformAuth(_sender)) {
                sendErrorResponse(
                    sendResponse,
                    null,
                    "FORBIDDEN",
                    "This sender cannot perform auth operations."
                );

                return;
            }

            authCoordinator.refresh()
                .then(({token, workerRevision}) => {
                    sendResponse({ok: true, token, workerRevision});
                })
                .catch(async (error) => {
                    let workerRevision;

                    try {
                        workerRevision = await authCoordinator.getWorkerRevision();
                    } catch (revisionError) {
                        console.error(
                            "Could not read worker revision:",
                            revisionError
                        );
                    }

                    sendErrorResponse(
                        sendResponse,
                        error,
                        "AUTH_REFRESH_FAILED",
                        "Could not refresh session.",
                        isValidWorkerRevision(workerRevision)
                            ? {workerRevision}
                            : {}
                    );
                })

            return true;
        }
        if (msg.type === "AUTH_LOGIN") {
            if (!canPerformAuth(_sender)) {
                sendErrorResponse(
                    sendResponse,
                    null,
                    "FORBIDDEN",
                    "This sender cannot perform auth operations."
                );

                return;
            }

            if (!isLoginPayloadValid(msg.payload)) {
                sendErrorResponse(
                    sendResponse,
                    null,
                    "FORBIDDEN",
                    "Payload sent is invalid."
                );

                return;
            }


            authCoordinator.login(msg.payload.username, msg.payload.password)
                .then(({response, workerRevision}) => {
                    sendResponse({ok: true, response, workerRevision});
                }).catch(error => {
                sendErrorResponse(
                    sendResponse,
                    error,
                    "AUTH_LOGIN_FAILED",
                    "Could not log in."
                );
            });

            return true;
        }

        if (msg.type === "AUTH_REGISTER") {
            if (!canPerformAuth(_sender)) {
                sendErrorResponse(
                    sendResponse,
                    null,
                    "FORBIDDEN",
                    "This sender cannot perform auth operations."
                );

                return;
            }

            if (!isRegisterPayloadValid(msg.payload)) {
                sendErrorResponse(
                    sendResponse,
                    null,
                    "FORBIDDEN",
                    "Payload sent is invalid."
                );

                return;
            }

            authCoordinator.register(msg.payload.username, msg.payload.password, msg.payload.balance)
                .then(({response, workerRevision}) => {
                    sendResponse({ok: true, response, workerRevision});
                }).catch(error => {
                sendErrorResponse(
                    sendResponse,
                    error,
                    "AUTH_REGISTER_FAILED",
                    "Could not register."
                );
            });

            return true;
        }
        if (msg.type === "AUTH_LOGOUT") {
            if (!canPerformAuth(_sender)) {
                sendErrorResponse(
                    sendResponse,
                    null,
                    "FORBIDDEN",
                    "This sender cannot perform auth operations."
                );

                return;
            }

            authCoordinator.logout()
                .then(({workerRevision}) => {
                    sendResponse({ok: true, workerRevision});
                }).catch(error => {
                sendErrorResponse(
                    sendResponse,
                    error,
                    "AUTH_LOGOUT_FAILED",
                    "Could not log out."
                );
            });

            return true;
        }
    }
}

chrome.runtime.onMessage.addListener(server_listeners());
chrome.runtime.onMessage.addListener(user_listeners());
chrome.runtime.onMessage.addListener(auth_listeners());


function isLoginPayloadValid(payload) {
    return payload !== null &&
        typeof payload === "object" &&
        !Array.isArray(payload) &&
        typeof payload.username === "string" &&
        typeof payload.password === "string"
}

function isRegisterPayloadValid(payload) {
    return isLoginPayloadValid(payload) && Number.isFinite(payload.balance)
}

function sendErrorResponse(
    sendResponse,
    error,
    fallbackCode,
    fallbackMessage,
    extraFields = {}
) {
    sendResponse({
        ...extraFields,
        ok: false,
        error: {
            code: error?.code || fallbackCode,
            message: error?.message || fallbackMessage,
        },
    });
}