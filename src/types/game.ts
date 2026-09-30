export interface Game {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface SteamPrice {
  currency?: string;
  initial?: number;
  final?: number;
  discount_percent?: number;
  initial_formatted?: string;
  final_formatted?: string;
}

export interface GameDetail extends Game {
  description?: string;
  released?: string;
  rating?: number;
  steamAppId?: number;
  steamPrice?: SteamPrice;
  extraImageUrls: string[];
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type FavoriteStatus =
  | "wishlist"
  | "favorite"
  | "owned"
  | "playing"
  | "completed";

export interface FavoriteGame {
  rawgId: number;
  slug?: string;
  name?: string;
  coverUrl?: string;
}

export interface FavoriteItem {
  status: string;
  createdAt?: string;
  game: FavoriteGame;
}

export interface PriceHistoryPoint {
  id: number;
  gameId: number;
  steamAppId: number;
  countryCode: string;
  currency: string;
  initialCents: number;
  finalCents: number;
  discountPct: number;
  capturedAt: string;
}

export interface GameReview {
  id: string;
  score: number;
  body?: string | null;
  createdAt?: string;
  username?: string;
}

export interface PriceAlert {
  id: string;
  gameId: number;
  targetCents: number;
  triggered: boolean;
  createdAt?: string;
}
