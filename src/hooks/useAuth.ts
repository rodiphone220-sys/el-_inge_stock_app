import { useState, useCallback } from "react";
import { authenticate, authenticateGoogle, getUsers, createUser, updateUserPassword, registerUser } from "@/lib/googleApi";
import type { User } from "@/lib/googleApi";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = "el_inge_auth";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Intentar cargar sesión guardada
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          user: parsed.user,
          token: parsed.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        };
      }
    } catch (e) {
      console.error("Error cargando sesión guardada:", e);
    }
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    };
  });

  const login = useCallback(async (username: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authenticate(username, password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
        
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        
        return { success: true, user };
      } else {
        const error = response.error || "Credenciales inválidas";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error,
        }));
        return { success: false, error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error de conexión";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Login con Google OAuth2
   */
  const loginWithGoogle = useCallback(async (googleToken: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authenticateGoogle(googleToken);
      
      if (response.success && response.data) {
        const { user, token, isNewUser } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
        
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        
        return { success: true, user, isNewUser };
      } else {
        const error = response.error || "Error autenticando con Google";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error,
        }));
        return { success: false, error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error de conexión";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  }, []);

  const register = useCallback(async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: "admin" | "user";
    phone?: string;
  }) => {
    try {
      const response = await registerUser(userData);
      
      if (response.success && response.data) {
        return { success: true, user: response.data };
      } else {
        return { success: false, error: response.error || "Error creando usuario" };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error de conexión";
      return { success: false, error: errorMessage };
    }
  }, []);

  const changePassword = useCallback(async (userId: string, newPassword: string) => {
    try {
      const response = await updateUserPassword(userId, newPassword);
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.error || "Error cambiando contraseña" };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error de conexión";
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    ...authState,
    login,
    loginWithGoogle,
    logout,
    register,
    changePassword,
  };
}
