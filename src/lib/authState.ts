import { createContext } from "react";
import type { AuthUser } from "../types/game";

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
