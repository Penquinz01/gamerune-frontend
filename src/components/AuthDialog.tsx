import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../lib/useAuth";

interface Props {
  open: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
}

function AuthDialog({ open, initialMode = "login", onClose }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login(usernameOrEmail.trim(), password);
      } else {
        await register(username.trim(), email.trim(), password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-[rgba(12,12,12,0.82)] px-3 py-2 text-[var(--text-h)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[rgba(255,255,255,0.44)]";

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 shadow-[var(--shadow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex rounded-lg border border-[var(--border)] p-1">
          {(["login", "register"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setMode(tab);
                setError(null);
              }}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition ${
                mode === tab
                  ? "bg-white text-black"
                  : "text-[var(--text-muted)] hover:text-[var(--text-h)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          {mode === "login" ? (
            <input
              className={inputClass}
              placeholder="Username or email"
              value={usernameOrEmail}
              onChange={(event) => setUsernameOrEmail(event.target.value)}
              required
              autoComplete="username"
            />
          ) : (
            <>
              <input
                className={inputClass}
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoComplete="username"
              />
              <input
                className={inputClass}
                placeholder="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </>
          )}
          <input
            className={inputClass}
            placeholder="Password (min 8 chars)"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-200">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-black transition hover:bg-gray-200 disabled:opacity-60"
          >
            {isSubmitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-h)]"
          >
            Cancel
          </button>
        </form>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          JWT is stored in localStorage and sent as a Bearer token to the backend.
        </p>
      </div>
    </div>
  );
}

export default AuthDialog;
