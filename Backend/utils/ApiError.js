class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}

/**
 * Summary:
 * - `ApiError` is a custom error class extending JavaScript's built-in `Error` class.
 * - It standardizes error handling in the API by including `statusCode`, `message`, `errors`, and `success: false`.
 * - Captures the stack trace automatically unless provided.
 *
 * Importance:
 * - Provides a structured way to handle API errors.
 * - Helps in debugging by maintaining stack traces.
 * - Ensures consistent error responses across the backend.
 *
 * Example Usage:
 * throw new ApiError(404, "Resource not found");
 */
