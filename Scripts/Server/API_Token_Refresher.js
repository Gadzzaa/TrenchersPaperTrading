import {AppError} from "../ErrorHandling/Helpers/AppError.js";
import {ChromeHandler} from "../ChromeHandler";

const AUTH_ERROR_CODES = new Set([
    "UNAUTHORIZED",
    "INVALID_SESSION",
    "AUTHORIZATION_TOKEN_REQUIRED",
    "REFRESH_TOKEN_REQUIRED",
]);

export function shouldAttempt(endpoint, headers, error) {
    if (endpoint === "/refresh-session")
        return false;

    const code =
        error?.code ||
        error?.meta?.json?.code ||
        error?.meta?.json?.error;

    if (!AUTH_ERROR_CODES.has(code)) return false;

    const authHeader = headers.Authorization;
    return typeof authHeader === "string" && authHeader.startsWith("Bearer ");
}

export async function requestFreshToken(createRequest) {
    const response = await createRequest()
        .includeCredentials()
        .addEndpoint("/refresh-session")
        .addMethod("POST")
        .build();

    if (typeof response?.token !== "string" || !response.token) {
        await ChromeHandler.sendMessageAsync("NO_SESSION");
        throw new AppError("Access token missing", {
            code: "INVALID_SESSION",
        });
    }

    return response.token;

}