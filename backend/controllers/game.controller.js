const gameService = require("../services/game.service");

/**
 * GET /api/game/pair
 * Returns two random movies for a new game round.
 */
async function getGamePair(req, res, next) {
    try {
        const movie1 = await gameService.getRandomGameMovie();
        const movie2 = await gameService.getRandomGameMovie([movie1.id]);
        res.json({ movie1, movie2 });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/game/next
 * Returns one new random movie (for continuing a streak).
 * Query param: excludeId — the ID of the current movie to avoid duplicates.
 */
async function getNextMovie(req, res, next) {
    try {
        const excludeId = parseInt(req.query.excludeId) || 0;
        const movie = await gameService.getRandomGameMovie(excludeId ? [excludeId] : []);
        res.json(movie);
    } catch (err) {
        next(err);
    }
}

module.exports = { getGamePair, getNextMovie };
