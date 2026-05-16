import { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { setAuthToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState(() => {
    return localStorage.getItem("devhub_token");
  });
  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("devhub_token", newToken);
      setAuthToken(newToken);
    } else {
      localStorage.removeItem("devhub_token");
      setAuthToken(null);
    }
  };
  useEffect(() => {
    setAuthToken(token);
  }, [token]);
  const { data, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });
  const user = data?.user ?? data ?? null;
  useEffect(() => {
    if (!isLoading && token && !user) {
      // Token might be invalid
      // setToken(null);
    }
  }, [isLoading, token, user]);
  const logout = () => {
    setToken(null);
    queryClient.clear();
  };
  return (
    <AuthContext.Provider value={{ user: user || null, token, setToken, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
