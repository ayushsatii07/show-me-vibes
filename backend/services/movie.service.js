const tmdb = require("./tmdb.service");

function formatRuntime(minutes) {
    if (!minutes || minutes <= 0) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

function extractDirector(credits) {
    if (!credits || !credits.crew) return "Unknown";
    const director = credits.crew.find(
        (c) => c.job === "Director" || c.job === "Series Director"
    );
    return director ? director.name : "Unknown";
}

function extractActors(credits, limit = 5) {
    if (!credits || !credits.cast) return [];
    return credits.cast.slice(0, limit).map((a) => a.name);
}

function extractGenres(genres) {
    if (!genres) return [];
    return genres.map((g) => g.name);
}

function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function getRandomRecommendation({ minRating, industry, type, includeAdult }) {
    const discoverFn = type === "tv" ? tmdb.discoverTV : tmdb.discoverMovies;
    const detailsFn = type === "tv" ? tmdb.getTVDetails : tmdb.getMovieDetails;

    let currentRating = minRating;
    let firstPage = null;
    let actualRating = minRating;

    while (currentRating >= 1) {
        firstPage = await discoverFn({ minRating: currentRating, includeAdult, industry, page: 1 });
        if (firstPage.results && firstPage.results.length > 0) {
            actualRating = currentRating;
            break;
        }
        currentRating -= 0.5;
    }

    if (!firstPage || !firstPage.results || firstPage.results.length === 0) {
        throw Object.assign(
            new Error("No results found matching your filters. Try lowering the rating or changing the industry."),
            { statusCode: 404 }
        );
    }

    const maxPage = Math.min(firstPage.total_pages, 500);
    const randomPage = Math.floor(Math.random() * maxPage) + 1;

    const page =
        randomPage === 1
            ? firstPage
            : await discoverFn({ minRating, includeAdult, industry, page: randomPage });

    const results = page.results && page.results.length > 0 ? page.results : firstPage.results;

    const picked = randomPick(results);
    const details = await detailsFn(picked.id);

    const runtime =
        type === "tv"
            ? details.episode_run_time && details.episode_run_time.length > 0
                ? formatRuntime(details.episode_run_time[0])
                : details.last_episode_to_air
                    ? formatRuntime(details.last_episode_to_air.runtime)
                    : "N/A"
            : formatRuntime(details.runtime);

    let director;
    if (type === "tv") {
        director =
            details.created_by && details.created_by.length > 0
                ? details.created_by.map((c) => c.name).join(", ")
                : extractDirector(details.credits);
    } else {
        director = extractDirector(details.credits);
    }

    return {
        tmdbId: details.id,  // included so frontend can fetch providers
        title: details.title || details.name,
        rating: Math.round((details.vote_average || 0) * 10) / 10,
        runtime,
        genres: extractGenres(details.genres),
        director,
        actors: extractActors(details.credits),
        overview: details.overview || "No overview available.",
        poster: tmdb.posterUrl(details.poster_path),
        isAdult: details.adult || false,
        type,
        ...(actualRating < minRating && {
            ratingNotice: `No results found for ${minRating}+. Showing closest match at ${actualRating}+ rating.`
        }),
    };
}

module.exports = { getRandomRecommendation };

