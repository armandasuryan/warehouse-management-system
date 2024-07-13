export function ErrorResponse(res, statusCode, message, error) {
    const response = {
        statusCode: statusCode || 404,
        message: message || 'Not Found',
        error: error || true
    };

    return res.status(statusCode).json(response)
}

export function SuccessResponse(res, statusCode, message, data) {
    const response = {
        statusCode: statusCode || 200,
        message: message || 'Success',
        data: data || []
    };

    return res.status(statusCode).json(response)
}
