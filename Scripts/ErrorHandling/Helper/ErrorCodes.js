class ErrorCodes {
  static Codes = Object.freeze({
    UNKNOWN: "UNKNOWN",
    NETWORK: "NETWORK",
    TIMEOUT: "TIMEOUT",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    RATE_LIMITED: "RATE_LIMITED",
    SERVER: "SERVER",
    BAD_REQUEST: "BAD_REQUEST",
    NO_LISTENER: "NO_LISTENER",
    CONTEXT_INVALIDATED: "CONTEXT_INVALIDATED",
  });

  static UserMessages = Object.freeze({
    UNKNOWN: "Something went wrong. Please try again.",
    NETWORK: "Network error. Check your connection and try again.",
    TIMEOUT: "Request timed out. Try again.",
    UNAUTHORIZED: "Please log in again.",
    FORBIDDEN: "You don’t have permission to do that.",
    NOT_FOUND: "Not found.",
    RATE_LIMITED: "Too many requests. Try again later.",
    SERVER: "Server error. Try again later.",
    BAD_REQUEST: "Invalid request.",
    NO_LISTENER: "Page isn’t ready yet. Refresh and try again.",
    CONTEXT_INVALIDATED: "Extension reloaded/updated. Refresh the page.",
  });
}
