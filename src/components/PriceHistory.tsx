import { useEffect, useState } from "react";
import { fetchPriceHistory } from "../lib/accountApi";
import type { PriceHistoryPoint } from "../types/game";

const formatMoney = (cents: number, currency: string) => {
  if (!currency) {
    return `${(cents / 100).toFixed(2)}`;
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.length === 3 ? currency : "USD",
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
};

function PriceHistory({ gameId }: { gameId: string }) {
  const [points, setPoints] = useState<PriceHistoryPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPriceHistory(gameId)
      .then((history) => {
        if (active) {
          setPoints(history);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load price history.");
        }
      });
    return () => {
      active = false;
    };
  }, [gameId]);

  if (error) {
    return <p className="text-sm text-[var(--text-muted)]">{error}</p>;
  }

  if (!points) {
    return <p className="text-sm text-[var(--text-muted)]">Loading price history...</p>;
  }

  if (points.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        No price history recorded yet. Open this game again later and the backend will track Steam
        prices automatically.
      </p>
    );
  }

  const chronological = [...points].reverse();
  const values = chronological.map((point) => point.finalCents);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const width = 300;
  const height = 80;
  const coords = chronological.map((point, index) => {
    const x = chronological.length === 1 ? width / 2 : (index / (chronological.length - 1)) * width;
    const y = height - 8 - ((point.finalCents - min) / span) * (height - 16);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lowest = chronological.reduce((a, b) => (a.finalCents <= b.finalCents ? a : b));

  return (
    <div className="grid gap-3">
      <div className="rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.72)] p-3">
        <p className="text-sm text-[var(--text-muted)]">
          {points.length} tracked price{points.length === 1 ? "" : "s"} · lowest{" "}
          <span className="font-semibold text-[var(--text-h)]">
            {formatMoney(lowest.finalCents, lowest.currency)}
          </span>
        </p>
        <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 h-20 w-full" role="img" aria-label="Price history chart">
          <polyline
            points={coords.join(" ")}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {chronological.map((point, index) => {
            const [x, y] = coords[index].split(",").map(Number);
            return <circle key={point.id} cx={x} cy={y} r="3" fill="white" opacity="0.8" />;
          })}
        </svg>
      </div>
      <ul className="grid max-h-40 gap-1 overflow-y-auto text-sm">
        {points.slice(0, 10).map((point) => (
          <li
            key={point.id}
            className="flex justify-between gap-2 rounded border border-[var(--border)] bg-[rgba(12,12,12,0.5)] px-2 py-1"
          >
            <span className="text-[var(--text-h)]">
              {formatMoney(point.finalCents, point.currency)}
              {point.discountPct > 0 && (
                <span className="ml-1 text-xs text-green-300">-{point.discountPct}%</span>
              )}
            </span>
            <span className="text-[var(--text-muted)]">
              {point.capturedAt ? new Date(point.capturedAt).toLocaleDateString() : point.countryCode}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PriceHistory;
