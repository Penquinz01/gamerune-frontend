interface Props {
  title: string;
  isExpanded: boolean;
  onClick: () => void;
}

function GameCard({ title, isExpanded, onClick }: Props) {
  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      onClick={onClick}
      className={`aspect-square rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-2 text-left shadow-[var(--shadow)] transition duration-150 hover:-translate-y-0.5 hover:border-[rgba(183,24,112,0.42)] focus:outline-none focus:ring-2 focus:ring-[rgba(183,24,112,0.28)] ${
        isExpanded ? "border-[rgba(183,24,112,0.5)]" : ""
      }`}
    >
      <div className="flex h-full min-h-0 flex-col gap-2">
        <div className="min-h-0 flex-1 rounded-lg border border-[rgba(183,24,112,0.18)] bg-[radial-gradient(circle_at_30%_20%,rgba(183,24,112,0.55),transparent_36%),linear-gradient(135deg,#852C5D,#522B40_52%,#33252D)]" />
        <h3 className="truncate text-center text-sm font-bold text-[var(--text-h)] sm:text-base">
          {title}
        </h3>
      </div>
    </button>
  );
}

export default GameCard;
