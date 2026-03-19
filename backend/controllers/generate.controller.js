const movieService = require("../services/movie.service");

/**
 * POST /api/generate
 *
 * Accepts the frontend's GenerateRequest shape and returns GenerateResponse.
 */
async function generate(req, res, next) {
    try {
        const { rating, minRating, industry, type, isAdult, includeAdult } = req.body;

        // Normalize field names (frontend sends "rating" & "isAdult",
        // but README spec uses "minRating" & "includeAdult" — support both)
        const filters = {
            minRating: minRating ?? rating ?? 7,
            industry: industry || "hollywood",
            type: type || "movie",
            includeAdult: includeAdult ?? isAdult ?? false,
        };

        const result = await movieService.getRandomRecommendation(filters);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = { generate };
