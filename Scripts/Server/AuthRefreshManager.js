import {AppError} from "../ErrorHandling/Helpers/AppError.js";
import CONFIG from "../../config.js";

export class AuthRefreshManager {
    static refreshInFlight = null;
    static AUTH_ERROR_CODES = new Set([
        "UNAUTHORIZED",
        "INVALID_SESSION",
        "AUTHORIZATION_TOKEN_REQUIRED",
        "REFRESH_TOKEN_REQUIRED",
    ]);

    static shouldAttempt({requestData, error}) {
        if (!requestData.autoRefreshAuth) return false;
        if (requestData.endpoint === "/refresh-session") return false;

        const code = error?.code || error?.meta?.json?.code || error?.meta?.json?.error;
        if (!AuthRefreshManager.AUTH_ERROR_CODES.has(code)) return false;

        const authHeader = requestData.headers?.Authorization;
        return typeof authHeader === "string" && authHeader.startsWith("Bearer ");
    }

    static attachRefreshedToken(requestData, token) {
        const authHeader = requestData.headers?.Authorization;
        if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
            requestData.headers.Authorization = `Bearer ${token}`;
        }
    }

    static async refreshAccessToken() {
        if (AuthRefreshManager.refreshInFlight) return AuthRefreshManager.refreshInFlight;

        AuthRefreshManager.refreshInFlight = (async () => {
            const response = await fetch(`${CONFIG.API_BASE_URL}/refresh-session`, {
                method: "POST",
                credentials: "include",
            });
            const json = await AuthRefreshManager.parseJson(response);
            if (!response.ok || !json?.token) {
                const code = AuthRefreshManager.extractAuthErrorCode(json);
                const message = json?.error || json?.message || "Session refresh failed";
                throw new AppError(message, {
                    code,
                    meta: {
                        status: response.status,
                        json,
                    },
                });
            }
            return json.token;
        })();

        try {
            return await AuthRefreshManager.refreshInFlight;
        } finally {
            AuthRefreshManager.refreshInFlight = null;
        }
    }

    /**
     * Refreshes access token when possible and falls back to the provided token.
     * @param {string | null | undefined} fallbackToken
     * @param {{swallowErrors?: boolean}} options
     * @returns {Promise<string | null>}
     */
    static async resolveAccessToken(fallbackToken = null, options = {}) {
        const {swallowErrors = true} = options;
        try {
            return await this.refreshAccessToken();
        } catch (error) {
            if (!swallowErrors) throw error;
            return fallbackToken || null;
        }
    }

    static async parseJson(response) {
        const contentType = response.headers.get("content-type") || "";
        const text = await response.text();
        if (!text) return {};

        if (contentType.includes("application/json")) {
            try {
                return JSON.parse(text);
            } catch {
                return {};
            }
        }

        try {
            return JSON.parse(text);
        } catch {
            return {message: text};
        }
    }

    static extractAuthErrorCode(json) {
        const codeCandidates = [json?.code, json?.error, json?.message];
        const code = codeCandidates.find(
            (value) => typeof value === "string" && /^[A-Z0-9_]+$/.test(value.trim()),
        );

        return code ? code.trim() : "INVALID_SESSION";
    }
}
