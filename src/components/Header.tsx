import { useAuth } from "../lib/useAuth";
import type { View } from "../App";

interface Props {
  view: View;
  onViewChange: (view: View) => void;
  onAuthClick: () => void;
}

function Header({ view, onViewChange, onAuthClick }: Props) {
  const { user, logout } = useAuth();

  return (
    <header className="min-h-16 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 flex flex-col gap-3 shadow-[var(--shadow)] backdrop-blur sm:px-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <h1 className="m-0 text-2xl font-bold leading-none text-[var(--text-h)]">
          Game Lister
        </h1>
        <nav className="flex gap-1 rounded-lg border border-[var(--border)] p-1">
          {(["browse", "wishlist"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onViewChange(tab)}
              className={`rounded-md px-3 py-1 text-sm font-semibold capitalize transition ${
                view === tab
                  ? "bg-white text-black"
                  : "text-[var(--text-muted)] hover:text-[var(--text-h)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search games..."
          className="w-full rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.82)] px-3 py-2 text-[var(--text-h)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[rgba(255,255,255,0.44)] focus:ring-2 focus:ring-[rgba(255,255,255,0.16)] sm:w-64"
        />
        {user ? (
          <div className="flex items-center gap-2">
            <span className="truncate text-sm text-[var(--text-muted)]" title={user.email}>
              {user.username}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-h)] transition hover:bg-[var(--accent-soft)]"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAuthClick}
            className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-black transition hover:bg-gray-200"
          >
            Login / Register
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
