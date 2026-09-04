const AUTH_ERROR_CODES = new Set([
    "UNAUTHORIZED",
    "INVALID_SESSION",
    "AUTHORIZATION_TOKEN_REQUIRED",
    "REFRESH_TOKEN_REQUIRED",
]);

const NO_SESSION_ERROR_CODES = new Set([
    ...AUTH_ERROR_CODES,
    "INVALID_TOKEN",
]);

function hasErrorCode(error, acceptedCodes) {
    const possibleCodes = [
        error?.code,
        error?.cause?.code,
        error?.meta?.json?.code,
        error?.meta?.json?.error,
        error?.meta?.json?.message,
    ];

    return possibleCodes.some(
        code => acceptedCodes.has(code)
    );
}

/**
 * An authentication failure that may initiate token renewal.
 * @param {unknown} error
 */
export function isAuthError(error) {
    return hasErrorCode(error, AUTH_ERROR_CODES);
}

/**
 * An authentication failure that should show logged-out UI.
 * @param {unknown} error
 */
export function isNoSessionError(error) {
    return hasErrorCode(error, NO_SESSION_ERROR_CODES);
}