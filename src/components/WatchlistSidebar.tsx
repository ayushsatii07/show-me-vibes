import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, X, Trash2, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { WatchlistItem } from "@/hooks/use-watchlist";

interface WatchlistSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  watchlist: WatchlistItem[];
  onRemove: (title: string) => void;
  onClear: () => void;
}

const WatchlistSidebar = ({
  isOpen,
  onToggle,
  watchlist,
  onRemove,
  onClear,
}: WatchlistSidebarProps) => {
  return (
    <>
      {/* Toggle Button — always visible */}
      <button
        onClick={onToggle}
        className="fixed top-6 right-6 z-40 flex items-center gap-2 px-3 py-2 rounded-lg glass text-foreground hover:bg-surface-hover transition-colors duration-300"
      >
        <Bookmark className="w-5 h-5 text-theme-accent" />
        {watchlist.length > 0 && (
          <span className="text-xs font-semibold bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
            {watchlist.length}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 h-full w-80 sm:w-96 glass border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-theme-accent" />
                <h2 className="font-display text-xl tracking-wider text-foreground">
                  WATCHLIST
                </h2>
                <span className="text-xs text-muted-foreground">({watchlist.length})</span>
              </div>
              <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {watchlist.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <Bookmark className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">
                  Your watchlist is empty. Save movies & shows to watch later!
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    <AnimatePresence>
                      {watchlist.map((item) => (
                        <motion.div
                          key={item.title}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          className="flex gap-3 p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors group"
                        >
                          <img
                            src={item.poster}
                            alt={item.title}
                            className="w-12 h-16 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Star className="w-3 h-3 text-theme-accent fill-current" />
                              <span className="text-xs text-muted-foreground">{item.rating}</span>
                              <Clock className="w-3 h-3 text-muted-foreground ml-1" />
                              <span className="text-xs text-muted-foreground">{item.runtime}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {item.genres.join(", ")}
                            </p>
                          </div>
                          <button
                            onClick={() => onRemove(item.title)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all self-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-destructive hover:text-destructive"
                    onClick={onClear}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Watchlist
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default WatchlistSidebar;
