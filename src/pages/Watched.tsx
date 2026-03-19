import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Clock, Film, Tv, ArrowLeft, Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getWatched, deleteWatched, updateWatchedRating, type WatchedItem } from "@/services/api";
import { useNavigate } from "react-router-dom";

const Watched = () => {
    const [items, setItems] = useState<WatchedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editRating, setEditRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const navigate = useNavigate();

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getWatched();
            setItems(data);
            setError(null);
        } catch {
            setError("Failed to load watched list");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleDelete = async (id: number) => {
        try {
            await deleteWatched(id);
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch {
            setError("Failed to delete item");
        }
    };

    const handleStartEdit = (item: WatchedItem) => {
        setEditingId(item.id);
        setEditRating(item.userRating);
        setHoverRating(0);
    };

    const handleSaveRating = async (id: number) => {
        try {
            await updateWatchedRating(id, editRating);
            setItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, userRating: editRating } : i))
            );
            setEditingId(null);
        } catch {
            setError("Failed to update rating");
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditRating(0);
        setHoverRating(0);
    };

    return (
        <div className="min-h-screen relative">
            {/* Film grain overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] animate-film-grain z-50"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                }}
            />

            <div className="container max-w-5xl mx-auto px-4 pb-12 relative z-10">
                {/* Header */}
                <header className="py-8 md:py-12">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Film className="w-8 h-8 md:w-10 md:h-10 text-theme-accent" />
                            <h1 className="font-display text-3xl md:text-5xl tracking-widest text-foreground">
                                WATCHED
                            </h1>
                        </div>
                        <Button
                            variant="ghost"
                            className="gap-2"
                            onClick={() => navigate("/")}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Home
                        </Button>
                    </div>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Your personal movie & TV show journal — {items.length} title{items.length !== 1 ? "s" : ""} watched
                    </p>
                </header>

                {/* Content */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center py-20"
                    >
                        <div className="animate-spin">
                            <Film className="w-10 h-10 text-theme-accent" />
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <p className="text-destructive mb-4">{error}</p>
                        <Button variant="outline" onClick={fetchItems}>
                            Try Again
                        </Button>
                    </motion.div>
                )}

                {!loading && !error && items.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <Film className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h2 className="font-display text-2xl tracking-wider text-muted-foreground mb-2">
                            NO MOVIES WATCHED YET
                        </h2>
                        <p className="text-muted-foreground text-sm mb-6">
                            Generate a recommendation and mark it as watched to start your journal.
                        </p>
                        <Button onClick={() => navigate("/")} className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Go Generate
                        </Button>
                    </motion.div>
                )}

                {!loading && !error && items.length > 0 && (
                    <div className="grid gap-4">
                        <AnimatePresence>
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50, height: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    className="glass rounded-xl overflow-hidden group"
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Poster */}
                                        <div className="sm:w-32 md:w-40 flex-shrink-0">
                                            <img
                                                src={item.poster}
                                                alt={item.title}
                                                className="w-full h-48 sm:h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                }}
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 p-4 md:p-5 space-y-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-display text-lg md:text-xl tracking-wider text-foreground leading-tight">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                            <Clock className="w-3 h-3" />
                                                            {item.runtime}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            TMDB: {item.tmdbRating}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {editingId !== item.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleStartEdit(item)}
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="glass border-border">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Remove from watched?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will remove "{item.title}" from your watched list. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Remove
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>

                                            {/* Genres */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {item.genres.map((genre) => (
                                                    <Badge key={genre} variant="secondary" className="text-[10px] px-2 py-0">
                                                        {genre}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* User Rating */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                                    Your Rating:
                                                </span>
                                                {editingId === item.id ? (
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                                            <button
                                                                key={star}
                                                                onMouseEnter={() => setHoverRating(star)}
                                                                onMouseLeave={() => setHoverRating(0)}
                                                                onClick={() => setEditRating(star)}
                                                                className="p-0 transition-transform hover:scale-125 focus:outline-none"
                                                            >
                                                                <Star
                                                                    className={`w-4 h-4 transition-colors ${star <= (hoverRating || editRating)
                                                                            ? "text-yellow-400 fill-yellow-400"
                                                                            : "text-muted-foreground/30"
                                                                        }`}
                                                                />
                                                            </button>
                                                        ))}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 ml-1"
                                                            onClick={() => handleSaveRating(item.id)}
                                                        >
                                                            <Check className="w-3.5 h-3.5 text-green-500" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`w-3.5 h-3.5 ${star <= item.userRating
                                                                        ? "text-yellow-400 fill-yellow-400"
                                                                        : "text-muted-foreground/20"
                                                                    }`}
                                                            />
                                                        ))}
                                                        <span className="text-sm font-semibold text-theme-accent ml-1">
                                                            {item.userRating}/10
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Watched date */}
                                            <p className="text-[11px] text-muted-foreground/60">
                                                Watched {new Date(item.watchedAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watched;
