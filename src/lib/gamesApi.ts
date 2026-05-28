import type { Game } from "../types/game";

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
const gamesEndpoint = import.meta.env.VITE_GAMES_ENDPOINT;

interface BackendGame {
  id?: string | number;
  name?: string;
  title?: string;
  imageUrl?: string;
  image_url?: string;
  coverUrl?: string;
  cover_url?: string;
}

interface BackendGamesResponse {
  games?: BackendGame[];
  results?: BackendGame[];
  data?: BackendGame[];
}

const normalizeGamesResponse = (response: BackendGamesResponse | BackendGame[]) => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.games ?? response.results ?? response.data ?? [];
};

export const fetchGamesPage = async (page: number, pageSize: number) => {
  const baseUrl = import.meta.env.DEV ? window.location.origin : backendBaseUrl;
  const url = new URL(gamesEndpoint, baseUrl);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("page_size", String(pageSize));

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
  }

  const gamesResponse = (await response.json()) as BackendGamesResponse | BackendGame[];

  return normalizeGamesResponse(gamesResponse)
    .slice(0, pageSize)
    .map<Game>((game, index) => ({
      id: String(game.id ?? `${page}-${index}`),
      name: game.name ?? game.title ?? "Untitled game",
      imageUrl: game.imageUrl ?? game.image_url ?? game.coverUrl ?? game.cover_url,
    }));
};
