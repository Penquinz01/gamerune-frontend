import { useEffect, useState } from "react";
import GameCard from "./GameCard";
import { fetchGameDetail, fetchGamesPage } from "../lib/gamesApi";
import {
  readGameDetailCache,
  readGamesCache,
  writeGameDetailCache,
  writeGamesCache,
} from "../lib/gameCache";
import type { Game, GameDetail } from "../types/game";

const FIRST_PAGE = 1;
const PAGE_SIZE = 20;

const getInitialGames = () => readGamesCache(FIRST_PAGE, PAGE_SIZE) ?? [];

function MainContent() {
  const [games, setGames] = useState<Game[]>(getInitialGames);
  const [isLoading, setIsLoading] = useState(() => getInitialGames().length === 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedGame, setExpandedGame] = useState<Game | null>(null);
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const closeExpandedGame = () => {
    setIsDetailVisible(false);
    window.setTimeout(() => setExpandedGame(null), 120);
  };

  const openExpandedGame = (game: Game) => {
    setExpandedGame(game);
    setGameDetail(null);
    setIsDetailLoading(true);
    setDetailErrorMessage(null);
    setSelectedImageIndex(0);
    window.history.pushState({ expandedGameId: game.id }, "", window.location.href);
  };

  useEffect(() => {
    if (games.length > 0) {
      return;
    }

    const loadGames = async () => {
      try {
        const fetchedGames = await fetchGamesPage(FIRST_PAGE, PAGE_SIZE);
        setGames(fetchedGames);
        setErrorMessage(null);
        writeGamesCache(FIRST_PAGE, PAGE_SIZE, fetchedGames);
      } catch (error) {
        setGames([]);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to fetch games",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadGames();
  }, [games.length]);

  useEffect(() => {
    if (!expandedGame) {
      return;
    }

    const showTimer = window.setTimeout(() => setIsDetailVisible(true), 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.history.back();
      }
    };

    const handlePopState = () => {
      closeExpandedGame();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [expandedGame]);

  useEffect(() => {
    if (!expandedGame) {
      return;
    }

    let isActiveRequest = true;

    const loadGameDetail = async () => {
      const cachedDetail = readGameDetailCache(expandedGame.id);

      if (cachedDetail) {
        setGameDetail(cachedDetail);
        setDetailErrorMessage(null);
        setIsDetailLoading(false);
        setSelectedImageIndex(0);
        return;
      }

      try {
        const fetchedDetail = await fetchGameDetail(expandedGame.id);

        if (isActiveRequest) {
          setGameDetail(fetchedDetail);
          setDetailErrorMessage(null);
          setSelectedImageIndex(0);
          writeGameDetailCache(fetchedDetail);
        }
      } catch (error) {
        if (isActiveRequest) {
          setDetailErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to fetch game details",
          );
        }
      } finally {
        if (isActiveRequest) {
          setIsDetailLoading(false);
        }
      }
    };

    void loadGameDetail();

    return () => {
      isActiveRequest = false;
    };
  }, [expandedGame]);

  const activeGame = gameDetail ?? expandedGame;
  const galleryImageUrls = activeGame
    ? [
        activeGame.imageUrl,
        ...(gameDetail?.extraImageUrls ?? []),
      ]
        .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
        .slice(0, 3)
    : [];

  const priceLabel =
    gameDetail?.steamPrice?.final_formatted ??
    gameDetail?.steamPrice?.initial_formatted ??
    "TBD";

  const selectedImageUrl =
    galleryImageUrls[selectedImageIndex] ?? galleryImageUrls[0];

  const showPreviousImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? galleryImageUrls.length - 1 : currentIndex - 1,
    );
  };

  const showNextImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === galleryImageUrls.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <>
      <main className="grid flex-1 auto-rows-min grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-5">
        {games.length > 0 ? (
          games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isExpanded={expandedGame?.id === game.id}
              onClick={() => openExpandedGame(game)}
            />
          ))
        ) : isLoading ? (
          <div className="col-span-full grid min-h-64 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-6 text-center shadow-[var(--shadow)]">
            <p className="text-lg font-semibold text-[var(--text-h)]">
              Loading games...
            </p>
          </div>
        ) : (
          <div className="col-span-full grid min-h-64 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-6 text-center shadow-[var(--shadow)]">
            <div className="grid gap-2">
              <p className="text-lg font-semibold text-[var(--text-h)]">
                No games found
              </p>
              {errorMessage && (
                <p className="text-sm text-[var(--text-muted)]">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {expandedGame && activeGame && (
        <section
          aria-modal="true"
          role="dialog"
          className={`fixed inset-0 z-50 grid min-h-screen bg-[rgba(0,0,0,0.96)] p-4 text-[var(--text)] transition duration-[120ms] ease-out sm:p-6 ${
            isDetailVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`flex min-h-0 flex-col rounded-xl border border-[rgba(255,255,255,0.18)] bg-[var(--surface-strong)] shadow-[var(--shadow)] transition duration-[120ms] ease-out ${
              isDetailVisible ? "scale-100" : "scale-[0.985]"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 sm:px-6">
              <h2 className="m-0 text-xl font-bold text-[var(--text-h)] sm:text-2xl">
                {activeGame.name}
              </h2>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-h)] transition hover:bg-[var(--accent-soft)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.18)]"
              >
                Close
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:grid-cols-[minmax(260px,420px)_1fr] sm:p-6">
              <div className="grid content-start gap-3">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-[rgba(255,255,255,0.16)] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_36%),linear-gradient(135deg,#2a2a2a,#171717_52%,#050505)]">
                  {selectedImageUrl && (
                    <img
                      key={selectedImageUrl}
                      src={selectedImageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-opacity duration-150"
                    />
                  )}

                  {galleryImageUrls.length > 1 && (
                    <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
                      <button
                        type="button"
                        onClick={showPreviousImage}
                        aria-label="Previous image"
                        className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-black/70 text-lg text-[var(--text-h)] transition hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.18)]"
                      >
                        {"<"}
                      </button>
                      <button
                        type="button"
                        onClick={showNextImage}
                        aria-label="Next image"
                        className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-black/70 text-lg text-[var(--text-h)] transition hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.18)]"
                      >
                        {">"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {galleryImageUrls.map((imageUrl, imageIndex) => (
                    <button
                      key={imageUrl}
                      type="button"
                      onClick={() => setSelectedImageIndex(imageIndex)}
                      aria-label={`Show image ${imageIndex + 1}`}
                      className={`aspect-video overflow-hidden rounded-lg border bg-[rgba(12,12,12,0.72)] transition focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.18)] ${
                        selectedImageIndex === imageIndex
                          ? "border-white"
                          : "border-[var(--border)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>

                {galleryImageUrls.length > 1 && (
                  <p className="text-center text-sm text-[var(--text-muted)]">
                    {selectedImageIndex + 1} / {galleryImageUrls.length}
                  </p>
                )}
              </div>

              <div className="grid content-start gap-4">
                <p className="max-w-3xl text-base text-[var(--text)]">
                  {isDetailLoading
                    ? "Loading game details..."
                    : gameDetail?.description ??
                      "No description available from the backend yet."}
                </p>

                {detailErrorMessage && (
                  <p className="rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.06)] p-3 text-sm text-[var(--text-muted)]">
                    {detailErrorMessage}
                  </p>
                )}

                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.72)] p-3">
                    <dt className="text-sm text-[var(--text-muted)]">Price</dt>
                    <dd className="font-semibold text-[var(--text-h)]">
                      {priceLabel}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.72)] p-3">
                    <dt className="text-sm text-[var(--text-muted)]">
                      Released
                    </dt>
                    <dd className="font-semibold text-[var(--text-h)]">
                      {gameDetail?.released ?? "TBD"}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.72)] p-3">
                    <dt className="text-sm text-[var(--text-muted)]">
                      Rating
                    </dt>
                    <dd className="font-semibold text-[var(--text-h)]">
                      {gameDetail?.rating ? `${gameDetail.rating}/5` : "TBD"}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.72)] p-3">
                    <dt className="text-sm text-[var(--text-muted)]">
                      Steam App ID
                    </dt>
                    <dd className="font-semibold text-[var(--text-h)]">
                      {gameDetail?.steamAppId ?? "TBD"}
                    </dd>
                  </div>
                </dl>
                <div className="grid gap-3">
                  <h3 className="text-base font-semibold text-[var(--text-h)]">
                    Image gallery
                  </h3>
                  {gameDetail && gameDetail.extraImageUrls.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)]">
                      The details endpoint returned only one image for this
                      game.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default MainContent;
