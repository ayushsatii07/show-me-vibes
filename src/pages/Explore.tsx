import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Flame, Loader2, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import WatchedSidebar from "@/components/WatchedSidebar";
import ExploreDetailSidebar from "@/components/ExploreDetailSidebar";
import { getExploreData, type ExploreData, type ExploreItem } from "@/services/api";

// ── Reusable card components ────────────────────────────────────────────

const MovieCard = ({
    item,
    index,
    onClick,
}: {
    item: ExploreItem;
    index: number;
    onClick: () => void;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={onClick}
        className="glass rounded-xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
    >
        <div className="relative aspect-[2/3]">
            <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Genre tags overlay on hover */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-3 gap-1.5">
                <div className="flex flex-wrap justify-center gap-1">
                    {(item.genres || []).slice(0, 3).map((g) => (
                        <Badge
                            key={g}
                            variant="secondary"
                            className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary-foreground border-primary/30"
                        >
                            {g}
                        </Badge>
                    ))}
                </div>
                <span className="text-[10px] text-white/60 mt-1">Click for details</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
                    {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-white/80 font-medium">{item.rating}</span>
                    </div>
                    {item.releaseDate && (
                        <span className="text-xs text-white/50">
                            {item.releaseDate.substring(0, 4)}
                        </span>
                    )}
                    {item.voteCount > 0 && (
                        <span className="text-xs text-white/40">
                            {item.voteCount >= 1000
                                ? `${(item.voteCount / 1000).toFixed(0)}K`
                                : item.voteCount}{" "}
                            votes
                        </span>
                    )}
                </div>
            </div>
        </div>
    </motion.div>
);

const TrendingCard = ({
    item,
    index,
    onClick,
}: {
    item: ExploreItem;
    index: number;
    onClick: () => void;
}) => (
    <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={onClick}
        className="flex-shrink-0 w-44 sm:w-52 glass rounded-xl overflow-hidden group hover:scale-[1.03] transition-transform duration-300 cursor-pointer"
    >
        <div className="relative aspect-[2/3]">
            <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            {/* Rank badge */}
            <div className="absolute top-2 left-2">
                <Badge className="bg-primary/90 text-primary-foreground font-display text-sm tracking-wider px-2">
                    #{index + 1}
                </Badge>
            </div>

            {/* Genre overlay on hover */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-3 gap-1.5">
                <div className="flex flex-wrap justify-center gap-1">
                    {(item.genres || []).slice(0, 3).map((g) => (
                        <Badge
                            key={g}
                            variant="secondary"
                            className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary-foreground border-primary/30"
                        >
                            {g}
                        </Badge>
                    ))}
                </div>
                <span className="text-[10px] text-white/60 mt-1">Click for details</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
                    {item.title}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-white/80 font-medium">{item.rating}</span>
                </div>
            </div>
        </div>
    </motion.div>
);

// ── Explore Page ────────────────────────────────────────────────────────

const Explore = () => {
    const [data, setData] = useState<ExploreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [watchedOpen, setWatchedOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ExploreItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getExploreData();
                setData(result);
            } catch {
                setError("Failed to load explore data.");
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const openDetail = (item: ExploreItem) => {
        setSelectedItem(item);
        setDetailOpen(true);
    };

    const closeDetail = () => {
        setDetailOpen(false);
    };

    return (
        <div className="min-h-screen relative">
            {/* Film grain */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] animate-film-grain z-50"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                }}
            />

            <WatchedSidebar
                isOpen={watchedOpen}
                onToggle={() => setWatchedOpen((o) => !o)}
            />

            <ExploreDetailSidebar
                item={selectedItem}
                isOpen={detailOpen}
                onClose={closeDetail}
            />

            <div className="container max-w-6xl mx-auto px-4 pb-12 relative z-10">
                <Header onWatchedToggle={() => setWatchedOpen((o) => !o)} />

                {loading && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-10 h-10 text-theme-accent animate-spin" />
                        <p className="font-display text-lg tracking-wider text-muted-foreground mt-4">
                            LOADING...
                        </p>
                    </div>
                )}

                {error && (
                    <div className="glass rounded-xl p-8 text-center">
                        <p className="text-destructive">{error}</p>
                    </div>
                )}

                {data && (
                    <Tabs defaultValue="trending" className="w-full">
                        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-surface/50 backdrop-blur-sm">
                            <TabsTrigger
                                value="trending"
                                className="gap-2 font-display tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                <Flame className="w-4 h-4" />
                                TRENDING
                            </TabsTrigger>
                            <TabsTrigger
                                value="highest"
                                className="gap-2 font-display tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                <Trophy className="w-4 h-4" />
                                HIGHEST RATED
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Tab 1: Trending / Most Watched ───────────────── */}
                        <TabsContent value="trending" className="space-y-10">
                            {/* Trending Movies */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                    <h2 className="font-display text-xl tracking-wider text-foreground">
                                        TRENDING MOVIES
                                    </h2>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                    {data.trendingMovies.map((m, i) => (
                                        <TrendingCard
                                            key={m.id}
                                            item={m}
                                            index={i}
                                            onClick={() => openDetail(m)}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Trending TV */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                    <h2 className="font-display text-xl tracking-wider text-foreground">
                                        TRENDING SHOWS
                                    </h2>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                    {data.trendingTV.map((m, i) => (
                                        <TrendingCard
                                            key={m.id}
                                            item={m}
                                            index={i}
                                            onClick={() => openDetail(m)}
                                        />
                                    ))}
                                </div>
                            </section>
                        </TabsContent>

                        {/* ── Tab 2: Highest Rated ─────────────────────────── */}
                        <TabsContent value="highest" className="space-y-10">
                            {/* Top Rated Movies */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    <h2 className="font-display text-xl tracking-wider text-foreground">
                                        HIGHEST RATED MOVIES
                                    </h2>
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] ml-auto text-muted-foreground"
                                    >
                                        3K+ votes
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {data.topMovies.map((m, i) => (
                                        <MovieCard
                                            key={m.id}
                                            item={m}
                                            index={i}
                                            onClick={() => openDetail(m)}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Top Rated TV */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    <h2 className="font-display text-xl tracking-wider text-foreground">
                                        HIGHEST RATED SHOWS
                                    </h2>
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] ml-auto text-muted-foreground"
                                    >
                                        3K+ votes
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {data.topTV.map((m, i) => (
                                        <MovieCard
                                            key={m.id}
                                            item={m}
                                            index={i}
                                            onClick={() => openDetail(m)}
                                        />
                                    ))}
                                </div>
                            </section>
                        </TabsContent>
                    </Tabs>
                )}

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

export default Explore;
