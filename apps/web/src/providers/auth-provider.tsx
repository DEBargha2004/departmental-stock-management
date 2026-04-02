import { AUTH_TOKEN } from "@/constants/id";
import { createContext, useContext, useState } from "react";

export type TAuthContext = {
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
};

const AuthContext = createContext<TAuthContext | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(AUTH_TOKEN),
  );
  // const navigate = useNavigate();

  const login = (token: string) => {
    localStorage.setItem(AUTH_TOKEN, token);
    setToken(token);
    // navigate("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
