import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { fetchReviews, submitReview } from "../lib/accountApi";
import { useAuth } from "../lib/useAuth";
import type { GameReview } from "../types/game";

interface Props {
  gameId: string;
  onRequireAuth: () => void;
}

function Reviews({ gameId, onRequireAuth }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(5);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchReviews(gameId)
      .then((data) => {
        if (active) {
          setReviews(data);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load reviews.");
        }
      });
    return () => {
      active = false;
    };
  }, [gameId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    setIsSubmitting(true);
    setStatus(null);
    try {
      await submitReview(gameId, score, body.trim() || undefined);
      setBody("");
      setStatus("Review saved.");
      setReviews(await fetchReviews(gameId));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-3">
      {error && <p className="text-sm text-[var(--text-muted)]">{error}</p>}
      {reviews.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No reviews yet. Be the first.</p>
      ) : (
        <ul className="grid max-h-48 gap-2 overflow-y-auto">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.72)] p-2 text-sm"
            >
              <p className="font-semibold text-[var(--text-h)]">
                {review.username ?? "Player"} · {review.score}/5
              </p>
              {review.body && <p className="mt-1 text-[var(--text)]">{review.body}</p>}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="grid gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="review-score" className="text-sm text-[var(--text-muted)]">
            Score
          </label>
          <select
            id="review-score"
            value={score}
            onChange={(event) => setScore(Number(event.target.value))}
            className="rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.82)] px-2 py-1 text-sm text-[var(--text-h)]"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={user ? "Write a review (optional)" : "Log in to write a review"}
          rows={2}
          className="w-full rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.82)] px-3 py-2 text-sm text-[var(--text-h)] placeholder:text-[var(--text-muted)] outline-none focus:border-[rgba(255,255,255,0.44)]"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-black transition hover:bg-gray-200 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : user ? "Submit review" : "Log in to review"}
        </button>
        {status && <p className="text-sm text-[var(--text-muted)]">{status}</p>}
      </form>
    </div>
  );
}

export default Reviews;
