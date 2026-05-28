function Header() {
  return (
    <header className="min-h-16 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 flex flex-col gap-3 shadow-[var(--shadow)] backdrop-blur sm:px-6 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="m-0 text-2xl font-bold leading-none text-[var(--text-h)]">
        Game Lister
      </h1>
      <input
        type="text"
        placeholder="Search games..."
        className="w-full rounded-lg border border-[var(--border)] bg-[rgba(51,44,48,0.72)] px-3 py-2 text-[var(--text-h)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[#B71870] focus:ring-2 focus:ring-[rgba(183,24,112,0.22)] sm:w-64"
      />
    </header>
  );
}

export default Header;
