const tmdb = require("../services/tmdb.service");

// TMDB genre ID → name mapping
const MOVIE_GENRES = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
    878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

const TV_GENRES = {
    10759: "Action & Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 10762: "Kids", 9648: "Mystery",
    10763: "News", 10764: "Reality", 878: "Sci-Fi & Fantasy", 10766: "Soap",
    10767: "Talk", 10768: "War & Politics", 37: "Western",
};

function genreNames(genreIds, mediaType) {
    const map = mediaType === "tv" ? TV_GENRES : MOVIE_GENRES;
    return (genreIds || []).map((id) => map[id]).filter(Boolean);
}

/**
 * Map a TMDB result item to a simplified card object.
 */
function mapItem(item, mediaType) {
    return {
        id: item.id,
        title: item.title || item.name,
        poster: tmdb.posterUrl(item.poster_path),
        rating: Math.round((item.vote_average || 0) * 10) / 10,
        releaseDate: item.release_date || item.first_air_date || "",
        overview: (item.overview || "").slice(0, 200),
        type: mediaType,
        voteCount: item.vote_count || 0,
        genres: genreNames(item.genre_ids, mediaType),
    };
}

const MIN_VOTES = 3000;

/**
 * Fetch top-rated items across multiple pages, filtering by vote count.
 * Returns at most `limit` items with vote_count >= MIN_VOTES.
 */
async function fetchTopRatedFiltered(mediaType, limit = 15) {
    const items = [];
    const maxPages = 10; // safety cap

    for (let page = 1; page <= maxPages && items.length < limit; page++) {
        const data = await tmdb.getTopRated(mediaType, page);
        const results = data.results || [];
        if (results.length === 0) break;

        for (const r of results) {
            if ((r.vote_count || 0) >= MIN_VOTES) {
                items.push(mapItem(r, mediaType));
                if (items.length >= limit) break;
            }
        }
    }

    return items;
}

/**
 * GET /api/explore
 * Returns trending (5 each) + top rated (15 each, vote_count >= 3000) for movies and TV.
 */
async function getExploreData(_req, res, next) {
    try {
        const [trendingMovies, trendingTV, topMovies, topTV] = await Promise.all([
            tmdb.getTrending("movie", "week"),
            tmdb.getTrending("tv", "week"),
            fetchTopRatedFiltered("movie", 15),
            fetchTopRatedFiltered("tv", 15),
        ]);

        res.json({
            trendingMovies: (trendingMovies.results || []).slice(0, 5).map((m) => mapItem(m, "movie")),
            trendingTV: (trendingTV.results || []).slice(0, 5).map((m) => mapItem(m, "tv")),
            topMovies,
            topTV,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getExploreData };
