import { createContext, useContext, useEffect, useState } from "react";

import {
  login as loginAPI,
  register as registerAPI,
  getCurrentUser,
  logout as logoutAPI,
  googleLogin as googleLoginAPI,
} from "../services/authService";

import { setPassword as setPasswordService } from "../services/authService";

import toast from "react-hot-toast";

// ==========================================
// CREATE CONTEXT
// ==========================================

const AuthContext = createContext(null);

// ==========================================
// AUTH PROVIDER
// ==========================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ========================================
  // CHECK AUTH WHEN APP LOADS
  // ========================================

  useEffect(() => {
    checkAuth();
  }, []);

  // ========================================
  // CHECK AUTHENTICATION
  // ========================================

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      // No token
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Load saved user first
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Invalid saved user:", error);
          localStorage.removeItem("user");
        }
      }

      const setUserPassword = async (password, currentPassword = null) => {
        const response = await setPasswordService(password, currentPassword);
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem("user", JSON.stringify(response.user));
        }
        return response;
      };

      // Add to the context value:
      const value = {
        // ...existing
        setUserPassword,
      };

      // Verify token with backend
      try {
        const response = await getCurrentUser();

        console.log("Current User:", response);

        if (response?.success) {
          const currentUser = response.user;
          setUser(currentUser);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(currentUser));
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        clearAuth();
      }
    } catch (error) {
      console.error("Authentication check error:", error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOGIN
  // ========================================

  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await loginAPI({ email, password });

      console.log("Login Response:", response);

      if (!response?.success) {
        toast.error(response?.message || "Login failed");
        return false;
      }

      // Save token
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // Save user
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
      }

      setIsAuthenticated(true);
      toast.success("Welcome back!");
      return true;
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error?.message ||
        error?.detail ||
        error?.response?.data?.message ||
        "Login failed";

      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // GOOGLE LOGIN
  // ========================================

  const loginWithGoogle = async (credential) => {
    try {
      setLoading(true);

      const response = await googleLoginAPI(credential);

      console.log("Google Login Response:", response);

      if (!response?.success) {
        toast.error(response?.message || "Google login failed");
        return false;
      }

      // Save token
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // Save user
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
      }

      setIsAuthenticated(true);
      toast.success(`Welcome, ${response.user.name}!`);
      return true;
    } catch (error) {
      console.error("Google login error:", error);

      const message =
        error?.message ||
        error?.detail ||
        error?.response?.data?.message ||
        "Google login failed";

      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // REGISTER
  // ========================================

  const register = async (userData) => {
    try {
      setLoading(true);

      const response = await registerAPI(userData);

      console.log("Register Response:", response);

      if (!response?.success) {
        toast.error(response?.message || "Registration failed");
        return false;
      }

      // Save token
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // Save user
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
      }

      setIsAuthenticated(true);
      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error?.message ||
        error?.detail ||
        error?.response?.data?.message ||
        "Registration failed";

      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // CLEAR AUTH
  // ========================================

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  // ========================================
  // LOGOUT
  // ========================================

  const logout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      toast.success("Logged out successfully");
    }
  };

  // ========================================
  // UPDATE USER
  // ========================================

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    loginWithGoogle, // ← NEW: Google login
    register,
    logout,
    updateUser,
  };

  // ========================================
  // PROVIDER
  // ========================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ==========================================
// USE AUTH HOOK
// ==========================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
