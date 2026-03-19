/**
 * Validate the request body for POST /api/generate.
 */
function validate(req, res, next) {
    const { rating, minRating, industry, type, isAdult, includeAdult } = req.body;

    const ratingVal = minRating ?? rating;
    const errors = [];

    // Rating
    if (ratingVal !== undefined) {
        const num = Number(ratingVal);
        if (isNaN(num) || num < 0 || num > 10) {
            errors.push("rating must be a number between 0 and 10");
        }
    }

    // Industry
    const validIndustries = ["bollywood", "hollywood"];
    if (industry && !validIndustries.includes(industry)) {
        errors.push(`industry must be one of: ${validIndustries.join(", ")}`);
    }

    // Type
    const validTypes = ["movie", "tv"];
    if (type && !validTypes.includes(type)) {
        errors.push(`type must be one of: ${validTypes.join(", ")}`);
    }

    // isAdult
    const adultVal = includeAdult ?? isAdult;
    if (adultVal !== undefined && typeof adultVal !== "boolean") {
        errors.push("isAdult must be a boolean");
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join("; ") });
    }

    next();
}

module.exports = validate;
