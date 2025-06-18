class ApiResponse{
    constructor(statusCode, data , message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse}

/**
 * Summary:
 * - `ApiResponse` is a utility class for structuring API responses.
 * - Contains `statusCode`, `data`, `message`, and a `success` flag.
 * - The `success` flag is `true` for status codes below 400, ensuring consistent response handling.
 * - Simplifies response handling in controllers and services.
 */
