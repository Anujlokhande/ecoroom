import { useState, useEffect, createContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/v1/me`,
          {
            withCredentials: true,
          },
        );
        setUser(res.data.user);
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);
  const login = (user) => {
    setUser(user);
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/v1/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
