function Sidebar() {
  return (
    <aside className="w-full border-b border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur md:w-60 md:min-h-[calc(100vh-4rem)] md:border-b-0 md:border-r">
      <h2 className="font-semibold mb-4 text-[var(--text-h)]">Filters</h2>

      <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        <button className="shrink-0 rounded p-2 text-left text-[var(--text)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-h)]">
          Action
        </button>
        <button className="shrink-0 rounded p-2 text-left text-[var(--text)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-h)]">
          Adventure
        </button>
        <button className="shrink-0 rounded p-2 text-left text-[var(--text)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-h)]">
          Racing
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
