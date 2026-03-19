import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import FilterPanel from "@/components/FilterPanel";
import ResultCard from "@/components/ResultCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import WatchlistSidebar from "@/components/WatchlistSidebar";
import WatchedSidebar from "@/components/WatchedSidebar";
import { useWatchlist } from "@/hooks/use-watchlist";
import { generateRecommendation, type GenerateRequest, type GenerateResponse } from "@/services/api";

const Index = () => {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<GenerateRequest | null>(null);
  const [activeType, setActiveType] = useState<"movie" | "tv">("movie");
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [watchedOpen, setWatchedOpen] = useState(false);

  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, clearWatchlist } = useWatchlist();

  const handleGenerate = useCallback(async (filters: GenerateRequest) => {
    setIsLoading(true);
    setError(null);
    setLastFilters(filters);

    try {
      const data = await generateRecommendation(filters);
      setResult(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch recommendation. Please try again.";
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (lastFilters) {
      handleGenerate(lastFilters);
    }
  }, [lastFilters, handleGenerate]);

  const handleBack = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  // Determine which view to show
  const showResult = result && !isLoading && !error;
  const showFilters = !showResult && !isLoading && !error;

  return (
    <div className={`min-h-screen relative ${activeType === "tv" ? "theme-tv" : ""}`}>
      {/* Film grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] animate-film-grain z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <WatchlistSidebar
        isOpen={watchlistOpen}
        onToggle={() => setWatchlistOpen((o) => !o)}
        watchlist={watchlist}
        onRemove={removeFromWatchlist}
        onClear={clearWatchlist}
      />

      <WatchedSidebar isOpen={watchedOpen} onToggle={() => setWatchedOpen((o) => !o)} />

      <div className="container max-w-4xl mx-auto px-4 pb-12 relative z-10">
        <Header onWatchedToggle={() => setWatchedOpen((o) => !o)} />

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {isLoading && <LoadingSpinner key="loading" />}

            {error && !isLoading && (
              <ErrorState
                key="error"
                message={error}
                onRetry={handleRegenerate}
                onChangeFilters={handleBack}
              />
            )}

            {showFilters && (
              <FilterPanel
                key="filters"
                onGenerate={handleGenerate}
                isLoading={isLoading}
                onTypeChange={setActiveType}
              />
            )}

            {showResult && (
              <ResultCard
                key={result.title}
                data={result}
                onRegenerate={handleRegenerate}
                isLoading={isLoading}
                onAddToWatchlist={addToWatchlist}
                isInWatchlist={isInWatchlist(result.title)}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
        </div>

        {/* TMDB Attribution */}
        <footer className="mt-12 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="TMDB Logo"
              className="h-5"
            />
          </a>
          <p className="text-xs text-muted-foreground text-center">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
