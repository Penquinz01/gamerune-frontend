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
  imageUrls?: string[];
  screenshotUrls?: string[];
  backgroundImage?: string;
  additionalImages?: BackendImage[];
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  screenshot1?: string;
  screenshot2?: string;
  screenshot3?: string;
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
  game.imageUrl ??
  game.image_url ??
  game.coverUrl ??
  game.cover_url ??
  game.backgroundImage ??
  game.background_image;

const isImageUrl = (value: string) =>
  /^https?:\/\//i.test(value) &&
  /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(value);

const collectImageUrls = (value: unknown): string[] => {
  if (typeof value === "string") {
    return isImageUrl(value) ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectImageUrls);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectImageUrls);
  }

  return [];
};

const normalizeImageList = (game: BackendGame) => {
  const imageSources = [
    game.imageUrl,
    game.image_url,
    game.coverUrl,
    game.cover_url,
    game.backgroundImage,
    game.background_image,
    game.imageUrl1,
    game.imageUrl2,
    game.imageUrl3,
    game.image1,
    game.image2,
    game.image3,
    game.screenshot1,
    game.screenshot2,
    game.screenshot3,
    ...(game.extraImageUrls ?? []),
    ...(game.imageUrls ?? []),
    ...(game.screenshotUrls ?? []),
    ...(game.screenshots ?? []),
    ...(game.images ?? []),
    ...(game.short_screenshots ?? []),
    ...(game.extraImages ?? []),
    ...(game.additionalImages ?? []),
  ];

  const uniqueImageUrls = new Set(
    [
      ...imageSources.map((image) => {
        if (!image) {
          return undefined;
        }

        return typeof image === "string"
          ? image
          : image.imageUrl ?? image.image ?? image.url;
      }),
      ...collectImageUrls(game),
    ]
      .filter((imageUrl): imageUrl is string => Boolean(imageUrl)),
  );

  return [...uniqueImageUrls];
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
  const imageUrls = normalizeImageList(game);

  return {
    id: String(game.id ?? gameId),
    name: game.name ?? game.title ?? "Untitled game",
    imageUrl: coverImageUrl,
    description: game.description,
    released: game.released,
    rating: game.rating,
    steamAppId: game.steamAppId,
    steamPrice: game.steamPrice,
    extraImageUrls: imageUrls
      .filter((imageUrl) => imageUrl !== coverImageUrl)
      .slice(0, 2),
  } satisfies GameDetail;
};
