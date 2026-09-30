import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  clearToken,
  getToken,
  setToken,
} from "./apiClient";
import { fetchProfile, login as loginRequest, register as registerRequest } from "./accountApi";
import { AuthContext } from "./authState";
import type { AuthUser } from "../types/game";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => getToken() !== null);

  useEffect(() => {
    if (!getToken()) {
      return;
    }
    let active = true;
    fetchProfile()
      .then((profile) => {
        if (active) {
          setUser({ id: profile.id, username: profile.username, email: profile.email });
        }
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const result = await loginRequest(usernameOrEmail, password);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const result = await registerRequest(username, email, password);
      setToken(result.token);
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
