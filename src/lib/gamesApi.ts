import type { Game, GameDetail, SteamPrice } from "../types/game";

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
const gamesEndpoint = import.meta.env.VITE_GAMES_ENDPOINT;
const gameDetailsEndpoint = import.meta.env.VITE_GAME_DETAILS_ENDPOINT;

interface BackendGame {
  id?: string | number;
  name?: string;
  title?: string;
  imageUrl?: string;
  image_url?: string;
  coverUrl?: string;
  cover_url?: string;
  background_image?: string;
  description?: string;
  released?: string;
  rating?: number;
  steamAppId?: number;
  steamPrice?: SteamPrice;
  screenshots?: BackendImage[];
  images?: BackendImage[];
  short_screenshots?: BackendImage[];
  extraImages?: BackendImage[];
  extraImageUrls?: string[];
}

interface BackendImage {
  image?: string;
  imageUrl?: string;
  url?: string;
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

const getBaseUrl = () =>
  import.meta.env.DEV ? window.location.origin : backendBaseUrl;

const getImageUrl = (game: BackendGame) =>
  game.imageUrl ?? game.image_url ?? game.coverUrl ?? game.cover_url ?? game.background_image;

const normalizeImageList = (game: BackendGame) => {
  const imageSources = [
    ...(game.extraImageUrls ?? []),
    ...(game.screenshots ?? []),
    ...(game.images ?? []),
    ...(game.short_screenshots ?? []),
    ...(game.extraImages ?? []),
  ];

  return imageSources
    .map((image) =>
      typeof image === "string" ? image : image.imageUrl ?? image.image ?? image.url,
    )
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));
};

export const fetchGamesPage = async (page: number, pageSize: number) => {
  const url = new URL(gamesEndpoint, getBaseUrl());
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
      imageUrl: getImageUrl(game),
    }));
};

export const fetchGameDetail = async (gameId: string) => {
  const detailPath = gameDetailsEndpoint.replace(":id", gameId);
  const url = new URL(detailPath, getBaseUrl());
  url.searchParams.set("countryCode", "US");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch game details: ${response.status} ${response.statusText}`);
  }

  const game = (await response.json()) as BackendGame;
  const coverImageUrl = getImageUrl(game);

  return {
    id: String(game.id ?? gameId),
    name: game.name ?? game.title ?? "Untitled game",
    imageUrl: coverImageUrl,
    description: game.description,
    released: game.released,
    rating: game.rating,
    steamAppId: game.steamAppId,
    steamPrice: game.steamPrice,
    extraImageUrls: normalizeImageList(game).filter(
      (imageUrl) => imageUrl !== coverImageUrl,
    ),
  } satisfies GameDetail;
};
