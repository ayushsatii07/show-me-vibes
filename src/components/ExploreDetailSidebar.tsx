import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import StreamingProviders from "@/components/StreamingProviders";
import type { ExploreItem } from "@/services/api";

interface ExploreDetailSidebarProps {
  item: ExploreItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ExploreDetailSidebar = ({ item, isOpen, onClose }: ExploreDetailSidebarProps) => {
  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            key="sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl z-[70]"
          >
            <div className="flex flex-col h-full">
              {/* Close button */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="font-display text-sm tracking-wider text-muted-foreground uppercase">
                  Details
                </h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-5">
                  {/* Poster */}
                  <div className="relative rounded-xl overflow-hidden aspect-[2/3] shadow-lg">
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-2xl tracking-wider text-foreground leading-tight">
                    {item.title}
                  </h2>

                  {/* Rating & Vote Count & Year */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-yellow-400">{item.rating}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-medium text-blue-300">
                        {item.voteCount >= 1000
                          ? `${(item.voteCount / 1000).toFixed(1)}K votes`
                          : `${item.voteCount} votes`}
                      </span>
                    </div>

                    {item.releaseDate && (
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {item.releaseDate.substring(0, 4)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Genre Tags */}
                  {item.genres && item.genres.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Genres
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.genres.map((genre) => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="text-xs px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Type */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs uppercase tracking-wider">
                      {item.type === "tv" ? "TV Show" : "Movie"}
                    </Badge>
                  </div>

                  {/* Overview */}
                  {item.overview && (
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Overview
                      </span>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {item.overview}
                      </p>
                    </div>
                  )}

                  {/* ── Streaming Providers ── */}
                  <div className="border-t border-border/50 pt-4">
                    <StreamingProviders
                      tmdbId={item.id}
                      type={item.type as "movie" | "tv"}
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExploreDetailSidebar;
