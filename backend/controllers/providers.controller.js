const tmdb = require("../services/tmdb.service");

/**
 * GET /api/providers/:type/:id
 * Returns streaming availability for IN and US regions.
 */
async function getProviders(req, res, next) {
    try {
        const { type, id } = req.params;

        if (!["movie", "tv"].includes(type)) {
            return res.status(400).json({ message: "type must be 'movie' or 'tv'" });
        }

        const tmdbId = parseInt(id);
        if (isNaN(tmdbId)) {
            return res.status(400).json({ message: "id must be a number" });
        }

        const providers = await tmdb.getWatchProviders(type, tmdbId);
        res.json(providers);
    } catch (err) {
        next(err);
    }
}

module.exports = { getProviders };
