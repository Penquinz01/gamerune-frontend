const TOKEN_KEY = "gamerune:token";

export const getBaseUrl = () => {
  const base = import.meta.env.VITE_BACKEND_BASE_URL as string | undefined;
  if (import.meta.env.DEV) {
    return window.location.origin;
  }
  if (!base) {
    throw new Error("VITE_BACKEND_BASE_URL is not configured.");
  }
  return base;
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const isAuthenticated = () => Boolean(getToken());

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export const apiFetch = async (path: string, options: ApiOptions = {}) => {
  const { auth = false, headers, ...init } = options;
  const finalHeaders = new Headers(headers);

  if (!finalHeaders.has("Content-Type") && init.body) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new Error("You need to log in first.");
    }
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(new URL(path, getBaseUrl()), {
    ...init,
    headers: finalHeaders,
  });

  if (response.status === 401) {
    clearToken();
  }

  return response;
};

export const readErrorMessage = async (
  response: Response,
  fallback: string,
) => {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? fallback;
  } catch {
    return fallback;
  }
};
