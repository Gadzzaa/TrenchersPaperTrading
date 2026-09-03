import {ChromeHandler} from "../ChromeHandler";
import {AppError} from "../ErrorHandling/Helpers/AppError";
import CONFIG from "../../config";

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH"]);
export const DEFAULT_TIMEOUT = 1000 * 5;
export const NUM_OF_RETRIES = 3;
export const API_BASE_URL = CONFIG.API_BASE_URL;


export const STATUS_MAP = Object.freeze({
    400: {code: "BAD_REQUEST", label: "Bad request"},
    401: {code: "UNAUTHORIZED", label: "Unauthorized"},
    408: {code: "TIMEOUT", label: "Request timeout"},
    403: {code: "FORBIDDEN", label: "Forbidden"},
    404: {code: "NOT_FOUND", label: "Not found"},
    429: {code: "RATE_LIMITED", label: "Too many requests"},
    500: {code: "SERVER", label: "Server error"},
    501: {code: "SERVER", label: "Server error"},
    502: {code: "SERVER", label: "Server error"},
    503: {code: "SERVER", label: "Server error"},
    504: {code: "SERVER", label: "Server error"},
});

export function validateEndpoint(endpoint) {
    if (typeof endpoint !== "string")
        throw new AppError("Endpoint must be a string", {
            code: "INVALID_ENDPOINT",
            meta: {
                endpoint,
                type: typeof endpoint,
            },
        });
}

export function validateMethod(method) {
    if (!ALLOWED_METHODS.has(method))
        throw new AppError("Invalid HTTP method", {
            code: "INVALID_METHOD",
            meta: {
                method,
            },
        });
}

export function validateHeaders(headers) {
    if (
        (typeof headers !== "object" && typeof headers !== "string") ||
        headers === null
    )
        throw new AppError("Headers must be an object or a string", {
            code: "INVALID_HEADERS",
            meta: {
                headers,
                type: typeof headers,
            },
        });
}

export function validateBody(body) {
    if (typeof body !== "string" && typeof body !== "object" && body !== null)
        throw new AppError("Body must be a string, object, or null", {
            code: "INVALID_BODY",
            meta: {
                body,
                type: typeof body,
            },
        });
}

export function createTimeoutReason(method, endpoint) {
    const requestLabel = `${method || "GET"} ${endpoint || "<unknown-endpoint>"}`;
    const message = `Exceeded ${DEFAULT_TIMEOUT}ms for ${requestLabel}`;
    const error = new Error(message);
    error.name = "TimeoutError";
    return error;
}

export function isNetworkError(error) {
    return (
        error.name === "TypeError" &&
        (error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError") ||
            error.message.includes("ERR_CONNECTION_REFUSED") ||
            error.message.includes("ERR_INTERNET_DISCONNECTED") ||
            error.message.includes("The network connection was lost"))
    );
}

export function isTimeoutError(error) {
    const name = error?.name;
    if (name === "AbortError" || name === "TimeoutError") return true;

    const message = String(error?.message ?? error ?? "").toLowerCase();
    return message.includes("aborted") || message.includes("timeout");
}


export function throwForErrorResponse(response, responseJSON) {
    const entry = STATUS_MAP[response.status] || {
        code: "UNKNOWN",
        label: `HTTP ${response.status}`,
    };

    const backendMessage =
        (typeof responseJSON?.error === "string" && responseJSON.error.trim()) ||
        (typeof responseJSON?.message === "string" && responseJSON.message.trim()) ||
        entry.label;
    const errorLooksLikeCode =
        typeof responseJSON?.error === "string" &&
        /^[A-Z0-9_]+$/.test(responseJSON.error.trim());
    const backendCode =
        (errorLooksLikeCode && responseJSON.error.trim()) ||
        (typeof responseJSON?.code === "string" && responseJSON.code.trim()) ||
        entry.code;

    throw new AppError(backendMessage, {
        code: backendCode,
        meta: {
            status: response.status,
            json: responseJSON,
            requestId: responseJSON?.requestId,
        },
    });
}

export function throwMappedError(error, context = {}) {
    const isTimeout = isTimeoutError(error);
    const isNetwork = isNetworkError(error);

    const meta = {
        status: context.response?.status,
        statusText: context.response?.statusText,
        requestId: context.json?.requestId,
        url: context.url,
        endpoint: context.endpoint,
        method: context.method,
        retry: context.retry,
        maxRetries: context.max_retries,
    }

    if (isTimeout || isNetwork) {
        ChromeHandler.sendMessage("no-internet");
        let error_name = isTimeout ? "Request timed out" : "Network error"
        let error_message = error.message
        throw new AppError(
            `${error_name}: ${error_message}`,
            {
                code: isTimeout ? "TIMEOUT" : "NETWORK",
                cause: error,
                meta,
            },
        );
    }

    if (error instanceof AppError) throw error;

    throw new AppError("Request failed: " + (error?.message || "Unknown error"), {
        code: error?.code || "UNKNOWN",
        cause: error,
        meta,
    });
}