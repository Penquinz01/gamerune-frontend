import { useEffect, useState } from "react";
import { fetchFavorites, removeFavorite } from "../lib/accountApi";
import { useAuth } from "../lib/useAuth";
import type { FavoriteItem } from "../types/game";

function WishlistView({ onRequireAuth }: { onRequireAuth: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    let active = true;
    fetchFavorites("wishlist")
      .then((data) => {
        if (active) {
          setItems(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load wishlist.");
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  const handleRefresh = () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    setError(null);
    fetchFavorites("wishlist")
      .then((data) => {
        setItems(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load wishlist.");
        setIsLoading(false);
      });
  };

  if (!user) {
    return (
      <main className="grid flex-1 place-items-center p-6">
        <div className="grid max-w-sm gap-3 text-center">
          <h2 className="text-xl font-bold text-[var(--text-h)]">Wishlist needs login</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Your wishlist is stored in the backend (JWT protected). Log in to see it on any device.
          </p>
          <button
            type="button"
            onClick={onRequireAuth}
            className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-black transition hover:bg-gray-200"
          >
            Login / Register
          </button>
        </div>
      </main>
    );
  }

  const handleRemove = async (rawgId: number) => {
    try {
      await removeFavorite(rawgId);
      setItems((current) => current.filter((item) => item.game.rawgId !== rawgId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item.");
    }
  };

  return (
    <main className="grid flex-1 auto-rows-min grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-5">
      <div className="col-span-full flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-h)]">
          Wishlist ({items.length})
        </h2>
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-h)] transition hover:bg-[var(--accent-soft)]"
        >
          Refresh
        </button>
      </div>
      {isLoading && <p className="col-span-full text-sm text-[var(--text-muted)]">Loading...</p>}
      {error && <p className="col-span-full text-sm text-red-300">{error}</p>}
      {!isLoading && items.length === 0 && !error && (
        <p className="col-span-full text-sm text-[var(--text-muted)]">
          Empty. Open a game and click &ldquo;Add to wishlist&rdquo;.
        </p>
      )}
      {items.map((item) => (
        <div
          key={item.game.rawgId}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-2 shadow-[var(--shadow)]"
        >
          <div className="aspect-square overflow-hidden rounded-lg border border-[rgba(255,255,255,0.14)] bg-[linear-gradient(135deg,#2a2a2a,#171717_52%,#050505)]">
            {item.game.coverUrl && (
              <img src={item.game.coverUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
            )}
          </div>
          <h3 className="truncate px-1 pt-2 text-center text-sm font-bold text-[var(--text-h)]">
            {item.game.name ?? `Game ${item.game.rawgId}`}
          </h3>
          <button
            type="button"
            onClick={() => void handleRemove(item.game.rawgId)}
            className="mt-2 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-h)]"
          >
            Remove
          </button>
        </div>
      ))}
    </main>
  );
}

export default WishlistView;
