import axios from "axios";

export interface GenerateRequest {
  rating: number;
  industry: "bollywood" | "hollywood";
  type: "movie" | "tv";
  isAdult: boolean;
}

export interface GenerateResponse {
  title: string;
  rating: number;
  runtime: string;
  genres: string[];
  director: string;
  actors: string[];
  overview: string;
  poster: string;
  isAdult: boolean;
  type: string;
  tmdbId?: number;
  ratingNotice?: string;
}

export interface WatchedItem {
  id: number;
  title: string;
  poster: string;
  tmdbRating: number;
  userRating: number;
  genres: string[];
  director: string;
  actors: string[];
  overview: string;
  runtime: string;
  isAdult: boolean;
  type: string;
  watchedAt: string;
}

export interface AddWatchedRequest extends GenerateResponse {
  userRating: number;
}

export interface WatchProvider {
  id: number;
  name: string;
  logo: string | null;
  type: "flatrate" | "rent" | "buy";
}

export interface ProvidersResponse {
  IN: WatchProvider[];
  US: WatchProvider[];
  link_IN: string | null;
  link_US: string | null;
}

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const generateRecommendation = async (
  filters: GenerateRequest
): Promise<GenerateResponse> => {
  const { data } = await apiClient.post<GenerateResponse>("/generate", filters);
  return data;
};

export const addWatched = async (
  item: AddWatchedRequest
): Promise<{ id: number; message: string }> => {
  const { data } = await apiClient.post("/watched", item);
  return data;
};

export const getWatched = async (type?: string): Promise<WatchedItem[]> => {
  const params = type ? `?type=${type}` : "";
  const { data } = await apiClient.get<WatchedItem[]>(`/watched${params}`);
  return data;
};

export const deleteWatched = async (id: number): Promise<void> => {
  await apiClient.delete(`/watched/${id}`);
};

export const updateWatchedRating = async (
  id: number,
  userRating: number
): Promise<void> => {
  await apiClient.put(`/watched/${id}`, { userRating });
};

// ── Providers API ───────────────────────────────────────────────────────

export const getProviders = async (
  type: "movie" | "tv",
  id: number
): Promise<ProvidersResponse> => {
  const { data } = await apiClient.get<ProvidersResponse>(`/providers/${type}/${id}`);
  return data;
};

// ── Game API ────────────────────────────────────────────────────────────

export interface GameMovie {
  id: number;
  title: string;
  poster: string;
  rating: number;
  budget: number;
  budgetFormatted: string;
  revenue: number;
  revenueFormatted: string;
  releaseDate: string;
  releaseYear: number;
  popularity: number;
  runtime: number;
  runtimeFormatted: string;
  voteCount: number;
}

export const getGamePair = async (): Promise<{ movie1: GameMovie; movie2: GameMovie }> => {
  const { data } = await apiClient.get("/game/pair");
  return data;
};

export const getNextGameMovie = async (excludeId: number): Promise<GameMovie> => {
  const { data } = await apiClient.get(`/game/next?excludeId=${excludeId}`);
  return data;
};

// ── Explore API ─────────────────────────────────────────────────────────

export interface ExploreItem {
  id: number;
  title: string;
  poster: string;
  rating: number;
  releaseDate: string;
  overview: string;
  type: string;
  voteCount: number;
  genres: string[];
}

export interface ExploreData {
  trendingMovies: ExploreItem[];
  trendingTV: ExploreItem[];
  topMovies: ExploreItem[];
  topTV: ExploreItem[];
}

export const getExploreData = async (): Promise<ExploreData> => {
  const { data } = await apiClient.get<ExploreData>("/explore");
  return data;
};