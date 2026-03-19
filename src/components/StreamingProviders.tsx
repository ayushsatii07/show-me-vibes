import { useState, useEffect } from "react";
import { Tv2, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProviders, type WatchProvider, type ProvidersResponse } from "@/services/api";

interface StreamingProvidersProps {
    tmdbId: number;
    type: "movie" | "tv";
}

// Known provider name → direct site URL (best effort)
const PROVIDER_LINKS: Record<string, string> = {
    "Netflix": "https://www.netflix.com",
    "Amazon Prime Video": "https://www.primevideo.com",
    "Disney Plus": "https://www.disneyplus.com",
    "Disney+": "https://www.disneyplus.com",
    "Hotstar": "https://www.hotstar.com",
    "JioCinema": "https://www.jiocinema.com",
    "SonyLIV": "https://www.sonyliv.com",
    "Zee5": "https://www.zee5.com",
    "Apple TV+": "https://tv.apple.com",
    "Apple TV": "https://tv.apple.com",
    "Max": "https://www.max.com",
    "HBO Max": "https://www.max.com",
    "Hulu": "https://www.hulu.com",
    "Paramount+": "https://www.paramountplus.com",
    "Peacock": "https://www.peacocktv.com",
    "Mubi": "https://mubi.com",
    "Aha": "https://www.aha.video",
    "Sun NXT": "https://www.sunnxt.com",
    "Voot": "https://www.voot.com",
    "MX Player": "https://www.mxplayer.in",
};

function getProviderLink(provider: WatchProvider, justWatchLink: string | null): string {
    return PROVIDER_LINKS[provider.name] || justWatchLink || `https://www.justwatch.com`;
}

const TYPE_LABEL: Record<string, string> = {
    flatrate: "Streaming",
    rent: "Rent",
    buy: "Buy",
};

const TYPE_COLOR: Record<string, string> = {
    flatrate: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    rent: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    buy: "bg-orange-500/15 text-orange-400 border-orange-500/25",
};

interface RegionProvidersProps {
    region: string;
    providers: WatchProvider[];
    link: string | null;
    flag: string;
}

const RegionProviders = ({ region, providers, link, flag }: RegionProvidersProps) => {
    if (providers.length === 0) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5">
                <span className="text-base">{flag}</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {region}
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {providers.map((p) => (
                    <a
                        key={p.id}
                        href={getProviderLink(p, link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border hover:border-theme-accent/40 transition-all duration-200"
                        title={`Watch on ${p.name} (${TYPE_LABEL[p.type] || p.type})`}
                    >
                        {p.logo ? (
                            <img
                                src={p.logo}
                                alt={p.name}
                                className="w-5 h-5 rounded object-cover flex-shrink-0"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                }}
                            />
                        ) : (
                            <Tv2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-xs font-medium text-foreground group-hover:text-theme-accent transition-colors whitespace-nowrap">
                            {p.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${TYPE_COLOR[p.type] || "bg-muted text-muted-foreground border-border"}`}>
                            {TYPE_LABEL[p.type] || p.type}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-theme-accent/60 transition-colors flex-shrink-0" />
                    </a>
                ))}
            </div>
        </div>
    );
};

const StreamingProviders = ({ tmdbId, type }: StreamingProvidersProps) => {
    const [data, setData] = useState<ProvidersResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setData(null);
        getProviders(type, tmdbId)
            .then(setData)
            .catch(() => setData({ IN: [], US: [], link_IN: null, link_US: null }))
            .finally(() => setLoading(false));
    }, [tmdbId, type]);

    const hasAny = data && (data.IN.length > 0 || data.US.length > 0);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Tv2 className="w-4 h-4 text-theme-accent flex-shrink-0" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Where to Watch
                </span>
            </div>

            {loading && (
                <div className="flex items-center gap-2 text-muted-foreground/60">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-xs">Checking availability...</span>
                </div>
            )}

            {!loading && !hasAny && (
                <p className="text-xs text-muted-foreground/60 italic">
                    Not available on streaming platforms in IN or US.
                </p>
            )}

            {!loading && hasAny && (
                <div className="space-y-4">
                    <RegionProviders
                        region="India"
                        providers={data!.IN}
                        link={data!.link_IN}
                        flag="🇮🇳"
                    />
                    <RegionProviders
                        region="United States"
                        providers={data!.US}
                        link={data!.link_US}
                        flag="🇺🇸"
                    />
                </div>
            )}
        </div>
    );
};

export default StreamingProviders;
