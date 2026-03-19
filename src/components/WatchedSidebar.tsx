import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Star, Trash2, Pencil, Check, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getWatched, deleteWatched, updateWatchedRating, type WatchedItem } from "@/services/api";
import { toast } from "sonner";

interface WatchedSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const WatchedSidebar = ({ isOpen, onToggle }: WatchedSidebarProps) => {
    const [tab, setTab] = useState<"movie" | "tv">("movie");
    const [items, setItems] = useState<WatchedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editRating, setEditRating] = useState(0);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getWatched(tab);
            setItems(data);
        } catch {
            // ignore
        }
        setLoading(false);
    }, [tab]);

    useEffect(() => {
        if (isOpen) fetchItems();
    }, [isOpen, fetchItems]);

    const handleDelete = async (id: number) => {
        try {
            await deleteWatched(id);
            setItems((prev) => prev.filter((i) => i.id !== id));
            toast.success("Removed from watched list");
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleSaveRating = async (id: number) => {
        try {
            await updateWatchedRating(id, editRating);
            setItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, userRating: editRating } : i))
            );
            setEditingId(null);
            toast.success("Rating updated");
        } catch {
            toast.error("Failed to update");
        }
    };

    const count = items.length;

    return (
        <>
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
                                <Eye className="w-5 h-5 text-theme-accent" />
                                <h2 className="font-display text-xl tracking-wider text-foreground">
                                    WATCHED
                                </h2>
                            </div>
                            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            <button
                                onClick={() => setTab("movie")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${tab === "movie"
                                        ? "text-theme-accent border-b-2 border-theme-accent"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Film className="w-4 h-4" />
                                Movies
                            </button>
                            <button
                                onClick={() => setTab("tv")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${tab === "tv"
                                        ? "text-theme-accent border-b-2 border-theme-accent"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Tv className="w-4 h-4" />
                                Shows
                            </button>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : count === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                                <Eye className="w-10 h-10 text-muted-foreground/40" />
                                <p className="text-muted-foreground text-sm">
                                    No {tab === "movie" ? "movies" : "shows"} watched yet. Start discovering!
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="flex-1">
                                <div className="p-3 space-y-2">
                                    <AnimatePresence>
                                        {items.map((item) => (
                                            <motion.div
                                                key={item.id}
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
                                                    {/* Rating */}
                                                    {editingId === item.id ? (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            {[...Array(10)].map((_, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setEditRating(i + 1)}
                                                                    className="p-0"
                                                                >
                                                                    <Star
                                                                        className={`w-3 h-3 ${i < editRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                                                                            }`}
                                                                    />
                                                                </button>
                                                            ))}
                                                            <button onClick={() => handleSaveRating(item.id)} className="ml-1 text-green-500 hover:text-green-400">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex items-center gap-0.5">
                                                                {[...Array(10)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-2.5 h-2.5 ${i < item.userRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{item.userRating}/10</span>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                        {item.genres.join(", ")}
                                                    </p>
                                                </div>
                                                {/* Actions */}
                                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all self-center">
                                                    <button
                                                        onClick={() => { setEditingId(item.id); setEditRating(item.userRating); }}
                                                        className="text-muted-foreground hover:text-theme-accent"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        )}
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};

export default WatchedSidebar;
