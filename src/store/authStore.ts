import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User, AuthTokens } from '../types/auth.types';
import authService from '../services/auth.service';

interface AuthActions {
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void; 
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (tokens: AuthTokens, user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user }),

      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      /**
       * ✅ Login - Tokenlar va user ma'lumotlarini saqlash
       */
      login: (tokens, user) => {
        authService.setAuthToken(tokens.accessToken);
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          error: null,
        });
      },

      /**
       * 🚪 Logout - Tizimdan chiqish
       */
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          authService.setAuthToken(null);
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      /**
       * 🔍 Check Auth - Token tekshirish
       */
      checkAuth: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          return false;
        }

        try {
          authService.setAuthToken(accessToken);
          const response = await authService.getCurrentUser();
          
          set({
            user: response.data,
            isAuthenticated: true,
          });
          
          return true;
        } catch (error) {
          console.error('Auth check failed:', error);
          
          // Agar token expired bo'lsa, refresh qilishga harakat qilamiz
          const refreshSuccess = await get().refreshAccessToken();
          return refreshSuccess;
        }
      },

      /**
       * 🔄 Refresh Token - Access token yangilash
       */
      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          return false;
        }

        try {
          const response = await authService.refreshToken(refreshToken);
          const { tokens } = response.data;

          authService.setAuthToken(tokens.accessToken);
          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });

          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);