import type { Game, GameDetail } from "../types/game";

const CACHE_TTL_MS = 1000 * 60 * 10;
const DETAILS_CACHE_KEY = "game-lister:game-details:lru";
const DETAILS_CACHE_LIMIT = 3;
const DETAILS_CACHE_VERSION = 3;

interface GamesCacheEntry {
  savedAt: number;
  games: Game[];
}

interface GameDetailCacheEntry {
  version?: number;
  gameId: string;
  lastUsedAt: number;
  detail: GameDetail;
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

const readDetailsCacheEntries = () => {
  const cachedValue = localStorage.getItem(DETAILS_CACHE_KEY);

  if (!cachedValue) {
    return [];
  }

  try {
    return JSON.parse(cachedValue) as GameDetailCacheEntry[];
  } catch {
    localStorage.removeItem(DETAILS_CACHE_KEY);
    return [];
  }
};

const writeDetailsCacheEntries = (entries: GameDetailCacheEntry[]) => {
  localStorage.setItem(DETAILS_CACHE_KEY, JSON.stringify(entries));
};

export const readGameDetailCache = (gameId: string) => {
  const cacheEntries = readDetailsCacheEntries();
  const currentCacheEntries = cacheEntries.filter(
    (entry) => entry.version === DETAILS_CACHE_VERSION,
  );
  const cachedEntry = currentCacheEntries.find((entry) => entry.gameId === gameId);

  if (!cachedEntry) {
    if (currentCacheEntries.length !== cacheEntries.length) {
      writeDetailsCacheEntries(currentCacheEntries);
    }

    return null;
  }

  const updatedEntries = currentCacheEntries.map((entry) =>
    entry.gameId === gameId ? { ...entry, lastUsedAt: Date.now() } : entry,
  );

  writeDetailsCacheEntries(updatedEntries);
  return cachedEntry.detail;
};

export const writeGameDetailCache = (detail: GameDetail) => {
  const cacheEntries = readDetailsCacheEntries().filter(
    (entry) => entry.gameId !== detail.id,
  );

  const updatedEntries = [
    ...cacheEntries,
    {
      version: DETAILS_CACHE_VERSION,
      gameId: detail.id,
      lastUsedAt: Date.now(),
      detail,
    },
  ]
    .sort((firstEntry, secondEntry) => secondEntry.lastUsedAt - firstEntry.lastUsedAt)
    .slice(0, DETAILS_CACHE_LIMIT);

  writeDetailsCacheEntries(updatedEntries);
};
