import { apiFetch, readErrorMessage } from "./apiClient";
import type {
  AuthResponse,
  FavoriteItem,
  GameReview,
  PriceAlert,
  PriceHistoryPoint,
} from "../types/game";

const ensureOk = async (response: Response, fallback: string) => {
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallback));
  }
};

export const register = async (
  username: string,
  email: string,
  password: string,
) => {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ Username: username, Email: email, Password: password }),
  });
  await ensureOk(response, "Registration failed.");
  return (await response.json()) as AuthResponse;
};

export const login = async (usernameOrEmail: string, password: string) => {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ UsernameOrEmail: usernameOrEmail, Password: password }),
  });
  if (response.status === 401) {
    throw new Error("Invalid username/email or password.");
  }
  await ensureOk(response, "Login failed.");
  return (await response.json()) as AuthResponse;
};

export const fetchProfile = async () => {
  const response = await apiFetch("/me", { auth: true });
  await ensureOk(response, "Failed to load profile.");
  return (await response.json()) as {
    id: string;
    username: string;
    email: string;
    createdAt?: string;
  };
};

export const fetchFavorites = async (status?: string) => {
  const path = status ? `/me/favorites?status=${encodeURIComponent(status)}` : "/me/favorites";
  const response = await apiFetch(path, { auth: true });
  await ensureOk(response, "Failed to load wishlist.");
  return (await response.json()) as FavoriteItem[];
};

export const upsertFavorite = async (rawgId: number, status: string) => {
  const response = await apiFetch("/me/favorites", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ RawgId: rawgId, Status: status }),
  });
  await ensureOk(response, "Failed to update wishlist.");
};

export const removeFavorite = async (rawgId: number) => {
  const response = await apiFetch(`/me/favorites/${rawgId}`, {
    method: "DELETE",
    auth: true,
  });
  if (response.status === 404) {
    return;
  }
  await ensureOk(response, "Failed to remove from wishlist.");
};

export const fetchPriceHistory = async (
  gameId: string,
  countryCode = "US",
) => {
  const response = await apiFetch(
    `/games/${encodeURIComponent(gameId)}/price-history?countryCode=${encodeURIComponent(countryCode)}`,
  );
  if (response.status === 404) {
    return [];
  }
  await ensureOk(response, "Failed to load price history.");
  return (await response.json()) as PriceHistoryPoint[];
};

export const fetchReviews = async (gameId: string) => {
  const response = await apiFetch(`/games/${encodeURIComponent(gameId)}/reviews`);
  if (response.status === 404) {
    return [];
  }
  await ensureOk(response, "Failed to load reviews.");
  return (await response.json()) as GameReview[];
};

export const submitReview = async (
  gameId: string,
  score: number,
  body?: string,
) => {
  const response = await apiFetch(`/games/${encodeURIComponent(gameId)}/reviews`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ Score: score, Body: body ?? null }),
  });
  await ensureOk(response, "Failed to submit review.");
};

export const fetchMyAlerts = async () => {
  const response = await apiFetch("/me/alerts", { auth: true });
  await ensureOk(response, "Failed to load price alerts.");
  return (await response.json()) as PriceAlert[];
};

export const createPriceAlert = async (gameId: string, targetCents: number) => {
  const response = await apiFetch(`/games/${encodeURIComponent(gameId)}/alerts`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ TargetCents: targetCents }),
  });
  await ensureOk(response, "Failed to create price alert.");
};
