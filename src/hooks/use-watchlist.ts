import { useState, useEffect, useCallback } from "react";
import type { GenerateResponse } from "@/services/api";

export interface WatchlistItem extends GenerateResponse {
  addedAt: number;
}

const STORAGE_KEY = "flickpick-watchlist";

function loadWatchlist(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(items: WatchlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(loadWatchlist);

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  const addToWatchlist = useCallback((item: GenerateResponse) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.title === item.title)) return prev;
      return [{ ...item, addedAt: Date.now() }, ...prev];
    });
  }, []);

  const removeFromWatchlist = useCallback((title: string) => {
    setWatchlist((prev) => prev.filter((w) => w.title !== title));
  }, []);

  const isInWatchlist = useCallback(
    (title: string) => watchlist.some((w) => w.title === title),
    [watchlist]
  );

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, []);

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, clearWatchlist };
}
