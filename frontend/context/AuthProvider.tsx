import { useState } from "react";
import { AuthContextType, AuthContext } from "./AuthContext";
import { request } from "../src/utils/api";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [token, setToken] = useState<AuthContextType["token"]>(() => {
    if (typeof window !== "undefined") localStorage.getItem("token");
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string) {
    setIsLoading(true);
    try {
      const response = await request("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      const token = response.token;
      const user = response.user;

      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
    } catch (e: unknown) {
      if (typeof e === "string") console.log(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function register(email: string, password: string) {
    setIsLoading(true);
    try {
      const response = await request("/auth/register", {
        method: "POST",
        body: { email, password },
      });

      const token = response.token;
      const user = response.user;

      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
    } catch (e: unknown) {
      if (typeof e === "string") console.log(e);
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  }

  const AuthProviderObject = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={AuthProviderObject}>
      {children}
    </AuthContext.Provider>
  );
};
