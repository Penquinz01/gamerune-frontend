import type { Game } from "../types/game";

const CACHE_TTL_MS = 1000 * 60 * 10;

interface GamesCacheEntry {
  savedAt: number;
  games: Game[];
}

const getCacheKey = (page: number, pageSize: number) =>
  `game-lister:games:page-${page}:size-${pageSize}`;

export const readGamesCache = (page: number, pageSize: number) => {
  const cachedValue = localStorage.getItem(getCacheKey(page, pageSize));

  if (!cachedValue) {
    return null;
  }

  try {
    const cachedEntry = JSON.parse(cachedValue) as GamesCacheEntry;
    const isFresh = Date.now() - cachedEntry.savedAt < CACHE_TTL_MS;

    return isFresh ? cachedEntry.games : null;
  } catch {
    localStorage.removeItem(getCacheKey(page, pageSize));
    return null;
  }
};

export const writeGamesCache = (
  page: number,
  pageSize: number,
  games: Game[],
) => {
  const cacheEntry: GamesCacheEntry = {
    savedAt: Date.now(),
    games,
  };

  localStorage.setItem(getCacheKey(page, pageSize), JSON.stringify(cacheEntry));
};
