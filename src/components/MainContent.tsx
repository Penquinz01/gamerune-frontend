import { useEffect, useState } from "react";
import GameCard from "./GameCard";

function MainContent() {
  const games = ["GTA V", "Minecraft", "Elden Ring", "Valorant"];
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const closeExpandedGame = () => {
    setIsDetailVisible(false);
    window.setTimeout(() => setExpandedGame(null), 120);
  };

  const openExpandedGame = (game: string) => {
    setExpandedGame(game);
    window.history.pushState({ expandedGame: game }, "", window.location.href);
  };

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

  return (
    <>
      <main className="grid flex-1 auto-rows-min grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-5">
        {games.map((game) => (
          <GameCard
            key={game}
            title={game}
            isExpanded={expandedGame === game}
            onClick={() => openExpandedGame(game)}
          />
        ))}
      </main>

      {expandedGame && (
        <section
          aria-modal="true"
          role="dialog"
          className={`fixed inset-0 z-50 grid min-h-screen bg-[rgba(51,37,45,0.96)] p-4 text-[var(--text)] transition duration-[120ms] ease-out sm:p-6 ${
            isDetailVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`flex min-h-0 flex-col rounded-xl border border-[rgba(183,24,112,0.32)] bg-[var(--surface-strong)] shadow-[var(--shadow)] transition duration-[120ms] ease-out ${
              isDetailVisible ? "scale-100" : "scale-[0.985]"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 sm:px-6">
              <h2 className="m-0 text-xl font-bold text-[var(--text-h)] sm:text-2xl">
                {expandedGame}
              </h2>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-h)] transition hover:bg-[var(--accent-soft)] focus:outline-none focus:ring-2 focus:ring-[rgba(183,24,112,0.28)]"
              >
                Close
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:grid-cols-[minmax(220px,360px)_1fr] sm:p-6">
              <div className="aspect-square rounded-xl border border-[rgba(183,24,112,0.24)] bg-[radial-gradient(circle_at_30%_20%,rgba(183,24,112,0.55),transparent_36%),linear-gradient(135deg,#852C5D,#522B40_52%,#33252D)]" />

              <div className="grid content-start gap-4">
                <p className="max-w-3xl text-base text-[var(--text)]">
                  Game description, pricing, ratings, completion time, and
                  ProtonDB compatibility details will appear here.
                </p>

                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-[var(--border)] bg-[rgba(51,44,48,0.62)] p-3">
                    <dt className="text-sm text-[var(--text-muted)]">Price</dt>
                    <dd className="font-semibold text-[var(--text-h)]">TBD</dd>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[rgba(51,44,48,0.62)] p-3">
                    <dt className="text-sm text-[var(--text-muted)]">
                      Time to finish
                    </dt>
                    <dd className="font-semibold text-[var(--text-h)]">TBD</dd>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[rgba(51,44,48,0.62)] p-3">
                    <dt className="text-sm text-[var(--text-muted)]">
                      Rating
                    </dt>
                    <dd className="font-semibold text-[var(--text-h)]">TBD</dd>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[rgba(51,44,48,0.62)] p-3">
                    <dt className="text-sm text-[var(--text-muted)]">
                      ProtonDB
                    </dt>
                    <dd className="font-semibold text-[var(--text-h)]">TBD</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default MainContent;
