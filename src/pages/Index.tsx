import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import FilterPanel from "@/components/FilterPanel";
import ResultCard from "@/components/ResultCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import { generateRecommendation, type GenerateRequest, type GenerateResponse } from "@/services/api";

const Index = () => {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<GenerateRequest | null>(null);

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

  return (
    <div className="min-h-screen relative">
      {/* Film grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] animate-film-grain z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="container max-w-4xl mx-auto px-4 pb-12 relative z-10">
        <Header />

        <div className="space-y-8">
          <FilterPanel onGenerate={handleGenerate} isLoading={isLoading} />

          <AnimatePresence mode="wait">
            {isLoading && <LoadingSpinner key="loading" />}

            {error && !isLoading && (
              <ErrorState
                key="error"
                message={error}
                onRetry={handleRegenerate}
              />
            )}

            {result && !isLoading && !error && (
              <ResultCard
                key={result.title}
                data={result}
                onRegenerate={handleRegenerate}
                isLoading={isLoading}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;
