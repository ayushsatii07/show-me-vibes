import { motion } from "framer-motion";
import { Star, Clock, Users, Megaphone, RefreshCw, AlertTriangle, Bookmark, BookmarkCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GenerateResponse } from "@/services/api";

interface ResultCardProps {
  data: GenerateResponse;
  onRegenerate: () => void;
  isLoading: boolean;
  onAddToWatchlist: (item: GenerateResponse) => void;
  isInWatchlist: boolean;
}

const ResultCard = ({ data, onRegenerate, isLoading, onAddToWatchlist, isInWatchlist }: ResultCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
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
              <Badge
                key={genre}
                variant="secondary"
                className="text-xs"
              >
                {genre}
              </Badge>
            ))}
          </div>

          {/* Director */}
          <div className="flex items-start gap-2">
            <Megaphone className="w-4 h-4 text-theme-accent mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Director
              </span>
              <p className="text-sm text-foreground">{data.director}</p>
            </div>
          </div>

          {/* Actors */}
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-theme-accent mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Cast
              </span>
              <p className="text-sm text-foreground">{data.actors.join(", ")}</p>
            </div>
          </div>

          {/* Overview */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
            {data.overview}
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
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
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  Watchlist
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;
