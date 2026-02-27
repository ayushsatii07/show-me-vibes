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
