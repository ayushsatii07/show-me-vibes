const db = require("../db");

// ── Prepared statements ─────────────────────────────────────────────────
const insertStmt = db.prepare(`
  INSERT INTO watched (title, poster, tmdbRating, userRating, genres, director, actors, overview, runtime, isAdult, type)
  VALUES (@title, @poster, @tmdbRating, @userRating, @genres, @director, @actors, @overview, @runtime, @isAdult, @type)
`);

const selectAllStmt = db.prepare(`
  SELECT * FROM watched ORDER BY watchedAt DESC
`);

const selectByTypeStmt = db.prepare(`
  SELECT * FROM watched WHERE type = ? ORDER BY watchedAt DESC
`);

const deleteStmt = db.prepare(`DELETE FROM watched WHERE id = ?`);

const updateRatingStmt = db.prepare(`
  UPDATE watched SET userRating = ? WHERE id = ?
`);

// ── Controllers ─────────────────────────────────────────────────────────

function addWatched(req, res, next) {
    try {
        const { title, poster, rating, userRating, genres, director, actors, overview, runtime, isAdult, type } = req.body;

        if (!title || userRating == null) {
            return res.status(400).json({ message: "title and userRating are required" });
        }

        const result = insertStmt.run({
            title,
            poster: poster || "",
            tmdbRating: rating ?? 0,
            userRating,
            genres: JSON.stringify(genres || []),
            director: director || "",
            actors: JSON.stringify(actors || []),
            overview: overview || "",
            runtime: runtime || "",
            isAdult: isAdult ? 1 : 0,
            type: type || "movie",
        });

        res.status(201).json({ id: result.lastInsertRowid, message: "Added to watched list" });
    } catch (err) {
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({ message: "This title is already in your watched list" });
        }
        next(err);
    }
}

function getWatched(req, res, next) {
    try {
        const { type } = req.query;
        const rows = type ? selectByTypeStmt.all(type) : selectAllStmt.all();
        const parsed = rows.map((row) => ({
            ...row,
            genres: JSON.parse(row.genres || "[]"),
            actors: JSON.parse(row.actors || "[]"),
            isAdult: !!row.isAdult,
        }));
        res.json(parsed);
    } catch (err) {
        next(err);
    }
}

function deleteWatched(req, res, next) {
    try {
        const { id } = req.params;
        const result = deleteStmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ message: "Not found" });
        }
        res.json({ message: "Removed from watched list" });
    } catch (err) {
        next(err);
    }
}

function updateWatched(req, res, next) {
    try {
        const { id } = req.params;
        const { userRating } = req.body;

        if (userRating == null) {
            return res.status(400).json({ message: "userRating is required" });
        }

        const result = updateRatingStmt.run(userRating, id);
        if (result.changes === 0) {
            return res.status(404).json({ message: "Not found" });
        }
        res.json({ message: "Rating updated" });
    } catch (err) {
        next(err);
    }
}

module.exports = { addWatched, getWatched, deleteWatched, updateWatched };
