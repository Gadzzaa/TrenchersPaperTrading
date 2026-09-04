import {ServerStatus} from "./Server/ServerStatus.js";
import {ChromeHandler} from "./ChromeHandler.js";
import {AuthCoordinator} from "./AuthCoordinator.js";

const allowedAuthPages = new Set([
    chrome.runtime.getURL("dashboard.html"),
    chrome.runtime.getURL("popup.html")
])

function isTrustedAuthSender(sender) {
    return (
        sender.id === chrome.runtime.id &&
        sender.origin === `chrome-extension://${chrome.runtime.id}` &&
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
            if (!isTrustedAuthSender(_sender)) {
                sendResponse({
                    ok: false,
                    error: {
                        code: "FORBIDDEN",
                        message:
                            "This sender cannot change session state.",
                    },
                });

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
                    sendResponse({
                        ok: false,
                        error: {
                            code:
                                error?.code ||
                                "SESSION_INVALIDATION_FAILED",
                            message:
                                error?.message ||
                                "Could not invalidate session.",
                        },
                    });
                });
           
            return true;
        }
        if (msg.type === "SESSION_VALID") {
            if (!isTrustedAuthSender(_sender)) {
                sendResponse({
                    ok: false,
                    error: {
                        code: "FORBIDDEN",
                        message:
                            "This sender cannot change session state.",
                    },
                });

                return;
            }

            const reportedRevision =
                msg.payload?.workerRevision;

            if (
                !Number.isSafeInteger(reportedRevision) ||
                reportedRevision < 0
            ) {
                sendResponse({
                    ok: false,
                    error: {
                        code: "INVALID_WORKER_REVISION",
                        message:
                            "Worker revision is missing or invalid.",
                    },
                });

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
                    sendResponse({
                        ok: false,
                        error: {
                            code:
                                error?.code ||
                                "SESSION_NOTIFICATION_FAILED",
                            message:
                                error?.message ||
                                "Could not notify session state.",
                        },
                    });
                });
            return true;
        }
    }
}

function auth_listeners() {
    return (msg, _sender, sendResponse) => {
        if (msg.type === "AUTH_REFRESH") {
            if (!isTrustedAuthSender(_sender)) {
                sendResponse({
                    ok: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "This sender cannot perform auth operations.",
                    },
                });
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

                    sendResponse({
                        ok: false,
                        ...(Number.isSafeInteger(workerRevision)
                            ? {workerRevision}
                            : {}),
                        error: {
                            code: error?.code || "AUTH_REFRESH_FAILED",
                            message: error?.message || "Could not refresh session.",
                        },
                    });
                })

            return true;
        }
        if (msg.type === "AUTH_LOGIN") {
            if (!isTrustedAuthSender(_sender)) {
                sendResponse({
                    ok: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "This sender cannot perform auth operations.",
                    },
                });
                return;
            }

            if (!isLoginPayloadValid(msg.payload)) {
                sendResponse({
                    ok: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "Payload sent is invalid.",
                    }
                })
                return;
            }


            authCoordinator.login(msg.payload.username, msg.payload.password)
                .then(({response, workerRevision}) => {
                    sendResponse({ok: true, response, workerRevision});
                }).catch((error) => {
                sendResponse({
                    ok: false,
                    error: {
                        code: error?.code || "AUTH_LOGIN_FAILED",
                        message: error?.message || "Could not log in.",
                    },
                });
            })

            return true;
        }

        if (msg.type === "AUTH_REGISTER") {
            if (!isTrustedAuthSender(_sender)) {
                sendResponse({
                    ok: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "This sender cannot perform auth operations.",
                    },
                });
                return;
            }

            if (!isRegisterPayloadValid(msg.payload)) {
                sendResponse({
                    ok: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "Payload sent is invalid.",
                    }
                })
                return;
            }

            authCoordinator.register(msg.payload.username, msg.payload.password, msg.payload.balance)
                .then(({response, workerRevision}) => {
                    sendResponse({ok: true, response, workerRevision});
                }).catch((error) => {
                sendResponse({
                    ok: false,
                    error: {
                        code: error?.code || "AUTH_REGISTER_FAILED",
                        message: error?.message || "Could not register.",
                    },
                });
            })

            return true;
        }
        if (msg.type === "AUTH_LOGOUT") {
            if (!isTrustedAuthSender(_sender)) {
                sendResponse({
                    ok: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "This sender cannot perform auth operations.",
                    },
                });
                return;
            }

            authCoordinator.logout()
                .then(({workerRevision}) => {
                    sendResponse({ok: true, workerRevision});
                }).catch((error) => {
                sendResponse({
                    ok: false,
                    error: {
                        code: error?.code || "AUTH_LOGOUT_FAILED",
                        message: error?.message || "Could not log out.",
                    },
                });
            })

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
