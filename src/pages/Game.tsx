import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, ArrowUp, ArrowDown, Calendar, RotateCcw, Gamepad2, Star, DollarSign, TrendingUp, Clock, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGamePair, getNextGameMovie, type GameMovie } from "@/services/api";
import { useNavigate } from "react-router-dom";

// ── Category config ─────────────────────────────────────────────────────
type CategoryKey = "rating" | "budget" | "revenue" | "releaseYear" | "runtime";

interface CategoryConfig {
    label: string;
    icon: typeof Star;
    getValue: (m: GameMovie) => number;
    getDisplay: (m: GameMovie) => string;
    higherLabel: string;
    lowerLabel: string;
    description: string;
}

const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
    rating: {
        label: "Rating",
        icon: Star,
        getValue: (m) => m.rating,
        getDisplay: (m) => `${m.rating}/10`,
        higherLabel: "Higher",
        lowerLabel: "Lower",
        description: "Which movie has a higher TMDB rating?",
    },
    budget: {
        label: "Budget",
        icon: DollarSign,
        getValue: (m) => m.budget,
        getDisplay: (m) => m.budgetFormatted,
        higherLabel: "Higher",
        lowerLabel: "Lower",
        description: "Which movie cost more to make?",
    },
    revenue: {
        label: "Earnings",
        icon: TrendingUp,
        getValue: (m) => m.revenue,
        getDisplay: (m) => m.revenueFormatted,
        higherLabel: "Higher",
        lowerLabel: "Lower",
        description: "Which movie earned more at the box office?",
    },
    releaseYear: {
        label: "Release",
        icon: Calendar,
        getValue: (m) => m.releaseYear,
        getDisplay: (m) => m.releaseDate,
        higherLabel: "Newer",
        lowerLabel: "Older",
        description: "Which movie came out more recently?",
    },
    runtime: {
        label: "Runtime",
        icon: Clock,
        getValue: (m) => m.runtime,
        getDisplay: (m) => m.runtimeFormatted,
        higherLabel: "Longer",
        lowerLabel: "Shorter",
        description: "Which movie has a longer runtime?",
    },
};

// ── Random theme colors ─────────────────────────────────────────────────
const THEME_PALETTES = [
    { bg: "from-violet-950 via-indigo-950 to-slate-950", accent: "text-violet-400", accentBg: "bg-violet-500", glow: "shadow-violet-500/20" },
    { bg: "from-cyan-950 via-teal-950 to-slate-950", accent: "text-cyan-400", accentBg: "bg-cyan-500", glow: "shadow-cyan-500/20" },
    { bg: "from-rose-950 via-pink-950 to-slate-950", accent: "text-rose-400", accentBg: "bg-rose-500", glow: "shadow-rose-500/20" },
    { bg: "from-amber-950 via-orange-950 to-slate-950", accent: "text-amber-400", accentBg: "bg-amber-500", glow: "shadow-amber-500/20" },
    { bg: "from-emerald-950 via-green-950 to-slate-950", accent: "text-emerald-400", accentBg: "bg-emerald-500", glow: "shadow-emerald-500/20" },
    { bg: "from-blue-950 via-sky-950 to-slate-950", accent: "text-blue-400", accentBg: "bg-blue-500", glow: "shadow-blue-500/20" },
    { bg: "from-fuchsia-950 via-purple-950 to-slate-950", accent: "text-fuchsia-400", accentBg: "bg-fuchsia-500", glow: "shadow-fuchsia-500/20" },
    { bg: "from-red-950 via-rose-950 to-slate-950", accent: "text-red-400", accentBg: "bg-red-500", glow: "shadow-red-500/20" },
];

const HIGHSCORE_KEY = "flickpick-game-highscore";

function getHighScore(): number {
    try {
        return parseInt(localStorage.getItem(HIGHSCORE_KEY) || "0", 10);
    } catch {
        return 0;
    }
}

function setHighScore(score: number) {
    localStorage.setItem(HIGHSCORE_KEY, String(score));
}

const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

function randomCategory(): CategoryKey {
    return CATEGORY_KEYS[Math.floor(Math.random() * CATEGORY_KEYS.length)];
}

// ── Game Component ──────────────────────────────────────────────────────

const Game = () => {
    const navigate = useNavigate();

    // Game state
    const [leftMovie, setLeftMovie] = useState<GameMovie | null>(null);
    const [rightMovie, setRightMovie] = useState<GameMovie | null>(null);
    const [category, setCategory] = useState<CategoryKey>(randomCategory);
    const [score, setScore] = useState(0);
    const [highScore, setHighScoreState] = useState(getHighScore());
    const [gameState, setGameState] = useState<"loading" | "playing" | "revealing" | "gameover">("loading");
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [flashColor, setFlashColor] = useState<"green" | "red" | null>(null);
    const [theme, setTheme] = useState(THEME_PALETTES[0]);
    const [loadingNext, setLoadingNext] = useState(false);

    const scoreRef = useRef(score);
    scoreRef.current = score;

    // Randomize theme
    const randomizeTheme = useCallback(() => {
        setTheme(THEME_PALETTES[Math.floor(Math.random() * THEME_PALETTES.length)]);
    }, []);

    // Start a new game
    const startGame = useCallback(async () => {
        setGameState("loading");
        setScore(0);
        setIsCorrect(null);
        setFlashColor(null);
        randomizeTheme();
        setCategory(randomCategory());

        try {
            const { movie1, movie2 } = await getGamePair();
            setLeftMovie(movie1);
            setRightMovie(movie2);
            setGameState("playing");

            // Prefetch next movie in background
            prefetchedRef.current = null;
            getNextGameMovie(movie2.id)
                .then((m) => { prefetchedRef.current = m; })
                .catch(() => { });
        } catch {
            setGameState("gameover");
        }
    }, [randomizeTheme]);

    useEffect(() => {
        startGame();
    }, [startGame]);

    // Ref for prefetched next movie
    const prefetchedRef = useRef<GameMovie | null>(null);

    // Handle player guess
    const handleGuess = useCallback(async (guess: "higher" | "lower") => {
        if (!leftMovie || !rightMovie || gameState !== "playing") return;

        const cat = CATEGORIES[category];
        const leftVal = cat.getValue(leftMovie);
        const rightVal = cat.getValue(rightMovie);

        let correct: boolean;
        if (guess === "higher") {
            correct = rightVal >= leftVal;
        } else {
            correct = rightVal <= leftVal;
        }

        setIsCorrect(correct);
        setGameState("revealing");

        // Flash
        setFlashColor(correct ? "green" : "red");
        setTimeout(() => setFlashColor(null), 600);

        if (correct) {
            const newScore = scoreRef.current + 1;
            setScore(newScore);
            if (newScore > highScore) {
                setHighScoreState(newScore);
                setHighScore(newScore);
            }

            // Use prefetched movie if available, otherwise fetch now
            setTimeout(async () => {
                setLoadingNext(true);
                randomizeTheme();
                setCategory(randomCategory());
                try {
                    const next = prefetchedRef.current || await getNextGameMovie(rightMovie.id);
                    prefetchedRef.current = null;
                    setLeftMovie(rightMovie);
                    setRightMovie(next);
                    setGameState("playing");
                    setIsCorrect(null);

                    // Prefetch the NEXT movie immediately
                    getNextGameMovie(next.id)
                        .then((m) => { prefetchedRef.current = m; })
                        .catch(() => { });
                } catch {
                    setGameState("gameover");
                }
                setLoadingNext(false);
            }, 1500);
        } else {
            // Game over after reveal
            setTimeout(() => {
                setGameState("gameover");
            }, 1800);
        }
    }, [leftMovie, rightMovie, category, gameState, highScore, randomizeTheme]);

    const cat = CATEGORIES[category];

    return (
        <div className={`min-h-screen relative bg-gradient-to-br ${theme.bg} transition-all duration-1000`}>
            {/* Full-screen flash overlay */}
            <AnimatePresence>
                {flashColor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`fixed inset-0 z-[60] pointer-events-none ${flashColor === "green" ? "bg-green-500" : "bg-red-500"
                            }`}
                    />
                )}
            </AnimatePresence>

            <div className="container max-w-6xl mx-auto px-4 py-6 relative z-10">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" className="gap-2 text-white/70 hover:text-white" onClick={() => navigate("/")}>
                        ← Home
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Zap className={`w-5 h-5 ${theme.accent}`} />
                            <span className="font-display text-2xl tracking-wider text-white">
                                {score}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-white/50 text-sm">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span>Best: {highScore}</span>
                        </div>
                    </div>
                </div>

                {/* Category badge — randomly assigned each round */}
                {(gameState === "playing" || gameState === "revealing") && (
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-6"
                    >
                        <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${theme.accentBg} text-white shadow-lg ${theme.glow}`}>
                            {(() => { const Icon = cat.icon; return <Icon className="w-4 h-4" />; })()}
                            <span className="font-display text-sm tracking-widest uppercase">{cat.description}</span>
                        </div>
                    </motion.div>
                )}

                {/* Loading state */}
                {gameState === "loading" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32"
                    >
                        <Gamepad2 className={`w-16 h-16 ${theme.accent} animate-pulse`} />
                        <p className="font-display text-xl tracking-wider text-white/60 mt-4">LOADING MOVIES...</p>
                    </motion.div>
                )}

                {/* Game board */}
                {(gameState === "playing" || gameState === "revealing") && leftMovie && rightMovie && (
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 md:gap-0 items-stretch">
                        {/* Left movie (known) */}
                        <motion.div
                            key={leftMovie.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="glass rounded-2xl overflow-hidden flex flex-col"
                        >
                            <div className="relative h-64 md:h-80">
                                <img
                                    src={leftMovie.poster}
                                    alt={leftMovie.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="font-display text-xl md:text-2xl tracking-wider text-white leading-tight">
                                        {leftMovie.title}
                                    </h3>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col items-center justify-center">
                                <span className="text-white/40 text-xs uppercase tracking-widest mb-2">{cat.label}</span>
                                <motion.span
                                    key={`left-${leftMovie.id}-${category}`}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`font-display text-3xl md:text-4xl tracking-wider ${theme.accent}`}
                                >
                                    {cat.getDisplay(leftMovie)}
                                </motion.span>
                            </div>
                        </motion.div>

                        {/* VS divider */}
                        <div className="flex md:flex-col items-center justify-center px-4 py-2 md:py-0">
                            <div className={`w-14 h-14 rounded-full ${theme.accentBg} flex items-center justify-center shadow-xl ${theme.glow}`}>
                                <span className="font-display text-lg text-white tracking-wider">VS</span>
                            </div>
                        </div>

                        {/* Right movie (guess) */}
                        <motion.div
                            key={rightMovie.id}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="glass rounded-2xl overflow-hidden flex flex-col"
                        >
                            <div className="relative h-64 md:h-80">
                                <img
                                    src={rightMovie.poster}
                                    alt={rightMovie.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="font-display text-xl md:text-2xl tracking-wider text-white leading-tight">
                                        {rightMovie.title}
                                    </h3>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col items-center justify-center">
                                {gameState === "revealing" ? (
                                    <>
                                        <span className="text-white/40 text-xs uppercase tracking-widest mb-2">{cat.label}</span>
                                        <motion.span
                                            initial={{ scale: 2, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", damping: 10 }}
                                            className={`font-display text-3xl md:text-4xl tracking-wider ${isCorrect ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {cat.getDisplay(rightMovie)}
                                        </motion.span>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="mt-2"
                                        >
                                            <Badge className={isCorrect ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                                                {isCorrect ? "✓ Correct!" : "✗ Wrong!"}
                                            </Badge>
                                        </motion.div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-white/40 text-xs uppercase tracking-widest mb-3">{cat.description}</span>
                                        <div className="flex flex-col gap-2 w-full max-w-[200px]">
                                            <Button
                                                onClick={() => handleGuess("higher")}
                                                className={`gap-2 ${theme.accentBg} hover:opacity-90 text-white font-display tracking-wider`}
                                                disabled={loadingNext}
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                                {cat.higherLabel}
                                            </Button>
                                            <Button
                                                onClick={() => handleGuess("lower")}
                                                variant="outline"
                                                className="gap-2 border-white/20 text-white hover:bg-white/10 font-display tracking-wider"
                                                disabled={loadingNext}
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                                {cat.lowerLabel}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Game Over */}
                <AnimatePresence>
                    {gameState === "gameover" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-16 md:py-24"
                        >
                            <div className="glass rounded-2xl p-8 md:p-12 max-w-md w-full text-center space-y-6">
                                <motion.div
                                    initial={{ y: -20 }}
                                    animate={{ y: 0 }}
                                    transition={{ type: "spring" }}
                                >
                                    <Gamepad2 className={`w-16 h-16 mx-auto mb-2 ${theme.accent}`} />
                                    <h2 className="font-display text-3xl md:text-4xl tracking-widest text-white">
                                        GAME OVER
                                    </h2>
                                </motion.div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-center gap-3">
                                        <Zap className={`w-6 h-6 ${theme.accent}`} />
                                        <span className="font-display text-4xl tracking-wider text-white">{score}</span>
                                    </div>
                                    <p className="text-white/50 text-sm">
                                        {score === 0 ? "Better luck next time!" : `You got ${score} in a row!`}
                                    </p>

                                    {score >= highScore && score > 0 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3, type: "spring" }}
                                        >
                                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1 text-sm">
                                                <Trophy className="w-4 h-4" />
                                                New High Score!
                                            </Badge>
                                        </motion.div>
                                    )}

                                    <div className="flex items-center justify-center gap-1 text-white/40 text-sm">
                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                        Best: {highScore}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={startGame}
                                        className={`gap-2 ${theme.accentBg} hover:opacity-90 text-white font-display tracking-wider text-lg`}
                                        size="lg"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                        PLAY AGAIN
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="gap-2 text-white/50 hover:text-white"
                                        onClick={() => navigate("/")}
                                    >
                                        Back to FlickPick
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Game;
