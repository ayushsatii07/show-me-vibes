import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Users, Megaphone, RefreshCw, AlertTriangle, Bookmark, BookmarkCheck, ArrowLeft, Eye, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import RatingDialog from "@/components/RatingDialog";
import StreamingProviders from "@/components/StreamingProviders";
import { addWatched, type GenerateResponse } from "@/services/api";

interface ResultCardProps {
  data: GenerateResponse;
  onRegenerate: () => void;
  isLoading: boolean;
  onAddToWatchlist: (item: GenerateResponse) => void;
  isInWatchlist: boolean;
  onBack: () => void;
}

const ResultCard = ({ data, onRegenerate, isLoading, onAddToWatchlist, isInWatchlist, onBack }: ResultCardProps) => {
  const [ratingOpen, setRatingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkedWatched, setIsMarkedWatched] = useState(false);

  const handleMarkWatched = async (userRating: number) => {
    setIsSubmitting(true);
    try {
      await addWatched({ ...data, userRating });
      setIsMarkedWatched(true);
      setRatingOpen(false);
      toast.success("Added to watched list!", {
        description: `${data.title} rated ${userRating}/10`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save. Try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          {/* Poster */}
          <div className="md:w-72 lg:w-80 flex-shrink-0 relative">
            <img
              src={data.poster}
              alt={data.title}
              className="w-full h-64 md:h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            {data.isAdult && (
              <div className="absolute top-3 left-3">
                <Badge variant="destructive" className="gap-1 font-semibold text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  18+
                </Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 p-6 md:p-8 space-y-4">
            {data.ratingNotice && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                <span>⚠️</span>
                <span>{data.ratingNotice}</span>
              </div>
            )}

            <div>
              <h2 className="font-display text-3xl md:text-4xl tracking-wider text-foreground leading-tight">
                {data.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-theme-accent">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{data.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{data.runtime}</span>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {data.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Director */}
            <div className="flex items-start gap-2">
              <Megaphone className="w-4 h-4 text-theme-accent mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Director</span>
                <p className="text-sm text-foreground">{data.director}</p>
              </div>
            </div>

            {/* Actors */}
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-theme-accent mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Cast</span>
                <p className="text-sm text-foreground">{data.actors.join(", ")}</p>
              </div>
            </div>

            {/* Overview */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {data.overview}
            </p>

            {/* ── Streaming Providers ── */}
            {data.tmdbId && (
              <>
                <Separator className="opacity-30" />
                <StreamingProviders
                  tmdbId={data.tmdbId}
                  type={data.type as "movie" | "tv"}
                />
              </>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={onBack} variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Filters
              </Button>
              <Button
                onClick={onRegenerate}
                disabled={isLoading}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
              <Button
                onClick={() => onAddToWatchlist(data)}
                variant={isInWatchlist ? "secondary" : "default"}
                className="gap-2"
                disabled={isInWatchlist}
              >
                {isInWatchlist ? (
                  <><BookmarkCheck className="w-4 h-4" />Saved</>
                ) : (
                  <><Bookmark className="w-4 h-4" />Watchlist</>
                )}
              </Button>
              <Button
                onClick={() => setRatingOpen(true)}
                variant={isMarkedWatched ? "secondary" : "outline"}
                className="gap-2"
                disabled={isMarkedWatched}
              >
                {isMarkedWatched ? (
                  <><CheckCircle2 className="w-4 h-4" />Watched</>
                ) : (
                  <><Eye className="w-4 h-4" />Mark as Watched</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <RatingDialog
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        movie={data}
        onConfirm={handleMarkWatched}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default ResultCard;
