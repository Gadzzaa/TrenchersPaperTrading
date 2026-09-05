import {AppError} from "../ErrorHandling/Helpers/AppError.js";
import {isAuthError} from "./AuthErrorHelper.js";

export function shouldAttempt(endpoint, headers, error) {
    if (endpoint === "/refresh-session")
        return false;

    if (!isAuthError(error))
        return false;

    const authHeader = headers.Authorization;
    return (
        typeof authHeader === "string" &&
        authHeader.startsWith("Bearer ")
    );
}

export async function requestFreshToken(API_Request) {
    const response = await API_Request()
        .includeCredentials()
        .addEndpoint("/refresh-session")
        .addMethod("POST")
        .build();

    if (typeof response?.token !== "string" || !response.token) {
        throw new AppError("Access token missing", {
            code: "INVALID_SESSION",
        });
    }

    return response.token;

}