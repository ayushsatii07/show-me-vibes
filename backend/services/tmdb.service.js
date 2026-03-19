const axios = require("axios");
const https = require("https");

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_LOGO = "https://image.tmdb.org/t/p/w92";

// Custom HTTPS agent to solve TLS socket disconnection issues
const httpsAgent = new https.Agent({
    keepAlive: false,
    rejectUnauthorized: true,
});

const tmdbClient = axios.create({
    baseURL: TMDB_BASE,
    httpsAgent,
    timeout: 15000,
});

function getApiKey() {
    const key = process.env.TMDB_API_KEY;
    if (!key || key === "your_tmdb_api_key_here") {
        throw new Error("TMDB_API_KEY is not configured. Add it to backend/.env");
    }
    return key;
}

async function tmdbGet(path, params, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const { data } = await tmdbClient.get(path, {
                params: { api_key: getApiKey(), ...params },
            });
            return data;
        } catch (err) {
            const isNetworkError =
                err.code === "ECONNRESET" ||
                err.code === "ETIMEDOUT" ||
                err.code === "ERR_SOCKET_CONNECTION_TIMEOUT" ||
                (err.message && err.message.includes("socket disconnected"));

            if (isNetworkError && attempt < retries) {
                console.log(`⚠️  TMDB request failed (attempt ${attempt}/${retries}), retrying...`);
                await new Promise((r) => setTimeout(r, 500 * attempt));
                continue;
            }
            throw err;
        }
    }
}

function industryParams(industry) {
    if (industry === "bollywood") {
        return { with_original_language: "hi", region: "IN" };
    }
    return { with_original_language: "en" };
}

async function discoverMovies({ minRating, includeAdult, industry, page = 1 }) {
    const data = await tmdbGet("/discover/movie", {
        sort_by: "vote_average.desc",
        "vote_average.gte": minRating,
        "vote_count.gte": 50,
        include_adult: includeAdult,
        page,
        ...industryParams(industry),
    });
    return { results: data.results, total_pages: data.total_pages };
}

async function discoverTV({ minRating, includeAdult, industry, page = 1 }) {
    const data = await tmdbGet("/discover/tv", {
        sort_by: "vote_average.desc",
        "vote_average.gte": minRating,
        include_adult: includeAdult,
        "vote_count.gte": 50,
        page,
        ...industryParams(industry),
    });
    return { results: data.results, total_pages: data.total_pages };
}

async function getMovieDetails(movieId) {
    return tmdbGet(`/movie/${movieId}`, { append_to_response: "credits" });
}

async function getTVDetails(tvId) {
    return tmdbGet(`/tv/${tvId}`, { append_to_response: "credits" });
}

async function getTrending(mediaType = "movie", timeWindow = "week") {
    return tmdbGet(`/trending/${mediaType}/${timeWindow}`, {});
}

async function getTopRated(mediaType = "movie", page = 1) {
    return tmdbGet(`/${mediaType}/top_rated`, { page });
}

/**
 * Get watch providers for a movie or TV show.
 * Returns providers for IN and US regions, paid platforms only (flatrate + rent + buy).
 *
 * @param {'movie'|'tv'} mediaType
 * @param {number} id - TMDB ID
 * @returns {Promise<Object>} { IN: [...], US: [...] }
 */
async function getWatchProviders(mediaType, id) {
    try {
        const data = await tmdbGet(`/${mediaType}/${id}/watch/providers`, {});
        const results = data.results || {};

        const formatRegion = (regionData) => {
            if (!regionData) return [];

            // Combine flatrate, rent, buy — deduplicate by provider_id
            const seen = new Set();
            const providers = [];

            for (const category of ["flatrate", "rent", "buy"]) {
                for (const p of regionData[category] || []) {
                    if (!seen.has(p.provider_id)) {
                        seen.add(p.provider_id);
                        providers.push({
                            id: p.provider_id,
                            name: p.provider_name,
                            logo: p.logo_path ? `${TMDB_LOGO}${p.logo_path}` : null,
                            type: category, // flatrate | rent | buy
                        });
                    }
                }
            }

            return providers;
        };

        return {
            IN: formatRegion(results.IN),
            US: formatRegion(results.US),
            // JustWatch link if available
            link_IN: results.IN?.link || null,
            link_US: results.US?.link || null,
        };
    } catch {
        return { IN: [], US: [], link_IN: null, link_US: null };
    }
}

function posterUrl(posterPath) {
    if (!posterPath) return "/placeholder.svg";
    return `${TMDB_IMG}${posterPath}`;
}

module.exports = {
    discoverMovies,
    discoverTV,
    getMovieDetails,
    getTVDetails,
    getTrending,
    getTopRated,
    getWatchProviders,
    posterUrl,
};
