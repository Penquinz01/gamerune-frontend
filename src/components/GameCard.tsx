import type { Game } from "../types/game";

interface Props {
  game: Game;
  isExpanded: boolean;
  onClick: () => void;
}

function GameCard({ game, isExpanded, onClick }: Props) {
  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      onClick={onClick}
      className={`aspect-square rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-2 text-left shadow-[var(--shadow)] transition duration-150 hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.34)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.22)] ${
        isExpanded ? "border-[rgba(255,255,255,0.46)]" : ""
      }`}
    >
      <div className="flex h-full min-h-0 flex-col gap-2">
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.14)] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_36%),linear-gradient(135deg,#2a2a2a,#171717_52%,#050505)]">
          {game.imageUrl && (
            <img
              src={game.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
        </div>
        <h3 className="truncate text-center text-sm font-bold text-[var(--text-h)] sm:text-base">
          {game.name}
        </h3>
      </div>
    </button>
  );
}

export default GameCard;
