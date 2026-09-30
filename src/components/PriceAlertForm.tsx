import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createPriceAlert, fetchMyAlerts } from "../lib/accountApi";
import { useAuth } from "../lib/useAuth";

function PriceAlertForm({ gameId, onRequireAuth }: { gameId: string; onRequireAuth: () => void }) {
  const { user } = useAuth();
  const [targetDollars, setTargetDollars] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    let active = true;
    fetchMyAlerts()
      .then((alerts) => {
        if (active) {
          setAlertCount(alerts.filter((alert) => String(alert.gameId) === String(gameId)).length);
        }
      })
      .catch(() => {
        if (active) {
          setAlertCount(null);
        }
      });
    return () => {
      active = false;
    };
  }, [gameId, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    const dollars = Number(targetDollars);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      setStatus("Enter a target price above 0.");
      return;
    }
    try {
      await createPriceAlert(gameId, Math.round(dollars * 100));
      setTargetDollars("");
      setStatus("Alert created. The backend worker will flag it when the price drops.");
      const alerts = await fetchMyAlerts();
      setAlertCount(alerts.filter((alert) => String(alert.gameId) === String(gameId)).length);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to create alert.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-2">
      <div className="flex gap-2">
        <input
          value={targetDollars}
          onChange={(event) => setTargetDollars(event.target.value)}
          placeholder="Target price, e.g. 19.99"
          inputMode="decimal"
          className="w-full rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.82)] px-3 py-2 text-sm text-[var(--text-h)] placeholder:text-[var(--text-muted)] outline-none focus:border-[rgba(255,255,255,0.44)]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-bold text-black transition hover:bg-gray-200"
        >
          Notify me
        </button>
      </div>
      <p className="text-sm text-[var(--text-muted)]">
        {user
          ? alertCount !== null
            ? `You have ${alertCount} alert${alertCount === 1 ? "" : "s"} for this game.`
            : "Get notified when the Steam price drops below your target."
          : "Log in to set a price alert."}
      </p>
      {status && <p className="text-sm text-[var(--text-muted)]">{status}</p>}
    </form>
  );
}

export default PriceAlertForm;
