/**
 * Global error handler middleware.
 * Matches the frontend's error extraction: err?.response?.data?.message
 */
function errorHandler(err, _req, res, _next) {
    console.error("❌ Error:", err.message);

    // If the error came from Axios (TMDB API call failure)
    if (err.response) {
        const status = err.response.status || 500;
        const tmdbMsg =
            err.response.data?.status_message || "TMDB API request failed";
        return res.status(status).json({ message: tmdbMsg });
    }

    // Custom statusCode set in service layer
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    res.status(statusCode).json({ message });
}

module.exports = errorHandler;
