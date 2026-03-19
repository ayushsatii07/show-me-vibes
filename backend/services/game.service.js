const tmdb = require("./tmdb.service");

/**
 * Format a number as a compact currency string.
 */
function formatMoney(value) {
    if (!value || value <= 0) return "$0";
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
}

function formatRuntime(minutes) {
    if (!minutes || minutes <= 0) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function buildGameMovie(details) {
    return {
        id: details.id,
        title: details.title || "Unknown",
        poster: tmdb.posterUrl(details.poster_path),
        rating: Math.round((details.vote_average || 0) * 10) / 10,
        budget: details.budget || 0,
        budgetFormatted: formatMoney(details.budget),
        revenue: details.revenue || 0,
        revenueFormatted: formatMoney(details.revenue),
        releaseDate: details.release_date || "Unknown",
        releaseYear: details.release_date ? parseInt(details.release_date.substring(0, 4)) : 0,
        popularity: Math.round((details.popularity || 0) * 10) / 10,
        runtime: details.runtime || 0,
        runtimeFormatted: formatRuntime(details.runtime),
        voteCount: details.vote_count || 0,
    };
}

// ── Movie Pool Cache ────────────────────────────────────────────────────
// Pre-fetch a batch of movies and serve from cache for instant responses.

let moviePool = [];
let poolLoading = false;
const POOL_SIZE = 15;       // keep 15 movies ready
const REFILL_THRESHOLD = 5; // refill when pool drops below 5

/**
 * Fill the movie pool in the background.
 * Fetches multiple movies in parallel for speed.
 */
async function fillPool() {
    if (poolLoading) return;
    poolLoading = true;

    try {
        const needed = POOL_SIZE - moviePool.length;
        if (needed <= 0) { poolLoading = false; return; }

        // Pick 3 random pages and fetch them in parallel
        const pages = [];
        for (let i = 0; i < 3; i++) {
            pages.push(Math.floor(Math.random() * 50) + 1);
        }

        const pageResults = await Promise.all(
            pages.map((p) =>
                tmdb.discoverMovies({
                    minRating: 5,
                    includeAdult: false,
                    industry: "hollywood",
                    page: p,
                }).catch(() => ({ results: [] }))
            )
        );

        // Combine all results, deduplicate, pick random subset
        const allMovies = pageResults.flatMap((p) => p.results || []);
        const existingIds = new Set(moviePool.map((m) => m.id));
        const unique = allMovies.filter((m) => !existingIds.has(m.id));

        // Shuffle and take what we need
        const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, needed);

        // Fetch details in parallel (batches of 5 for speed)
        for (let i = 0; i < shuffled.length; i += 5) {
            const batch = shuffled.slice(i, i + 5);
            const details = await Promise.all(
                batch.map((m) => tmdb.getMovieDetails(m.id).catch(() => null))
            );
            for (const d of details) {
                if (d && (d.budget > 0 || d.revenue > 0)) {
                    moviePool.push(buildGameMovie(d));
                }
            }
        }

        console.log(`🎮 Movie pool: ${moviePool.length} movies ready`);
    } catch (err) {
        console.error("Pool fill error:", err.message);
    }

    poolLoading = false;
}

/**
 * Get a random movie from the pool, or fetch one directly as fallback.
 */
async function getRandomGameMovie(excludeIds = []) {
    // Try from pool first
    const available = moviePool.filter((m) => !excludeIds.includes(m.id));
    if (available.length > 0) {
        const picked = randomPick(available);
        // Remove from pool
        moviePool = moviePool.filter((m) => m.id !== picked.id);
        // Trigger background refill if pool is low
        if (moviePool.length < REFILL_THRESHOLD) {
            fillPool();
        }
        return picked;
    }

    // Fallback: direct fetch
    const randomPage = Math.floor(Math.random() * 50) + 1;
    const page = await tmdb.discoverMovies({
        minRating: 5,
        includeAdult: false,
        industry: "hollywood",
        page: randomPage,
    });

    let candidates = (page.results || []).filter((m) => !excludeIds.includes(m.id));
    if (candidates.length === 0) candidates = page.results || [];

    const picked = randomPick(candidates);
    const details = await tmdb.getMovieDetails(picked.id);

    // Also trigger pool fill for future requests
    fillPool();

    return buildGameMovie(details);
}

// Start filling pool on module load (warm up)
fillPool();

module.exports = { getRandomGameMovie };
