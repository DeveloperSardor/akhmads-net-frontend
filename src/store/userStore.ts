// src/store/userStore.ts
import { create } from 'zustand';
import type { User, Wallet, UserStats, Ad, Bot, RevenueData, CtrData } from '../types/user.types';
import userService from '../services/user.service';

interface UserState {
  profile: User | null;
  wallet: Wallet | null;
  stats: UserStats | null;
  ads: Ad[];
  bots: Bot[];
  revenueData: RevenueData[];
  ctrData: CtrData[];
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  fetchProfile: () => Promise<void>;
  fetchAds: (params?: { status?: string; limit?: number; offset?: number }) => Promise<void>;
  fetchBots: (params?: { status?: string; limit?: number; offset?: number }) => Promise<void>;
  fetchAnalytics: (days?: number, type?: 'advertiser' | 'owner') => Promise<void>;
  deleteAd: (adId: string) => Promise<void>;
  deleteBot: (botId: string) => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    locale?: string;
  }) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState & UserActions>((set) => ({
  profile: null,
  wallet: null,
  stats: null,
  ads: [],
  bots: [],
  revenueData: [],
  ctrData: [],
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getProfile();
      const fetchedUser = response.data.user;

      set({
        profile: fetchedUser,
        wallet: response.data.wallet,
        stats: response.data.stats,
        isLoading: false,
      });

      // Synchronize with authStore to prevent roles loss on navigation/reload
      import('./authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().setUser(fetchedUser);
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch profile',
        isLoading: false,
      });
    }
  },

  fetchAds: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUserAds(params);
      // Response: { success, data: [...], pagination }
      // Axios wraps it: response.data = { success, data: [...], pagination }
      const ads = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      set({ ads, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch ads',
        ads: [],
        isLoading: false,
      });
    }
  },

  fetchBots: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUserBots(params);
      const rawBots = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data.bots)
          ? response.data.bots
          : Array.isArray(response.data)
            ? response.data
            : [];

      const bots = rawBots.map((bot: any) => ({
        ...bot,
        subscribers: bot.totalMembers || 0,
        earnings: typeof bot.totalEarnings === 'string'
          ? parseFloat(bot.totalEarnings)
          : bot.totalEarnings || 0,
        impressionsServed: bot.impressionsServed || 0,
      }));

      set({ bots, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch bots',
        bots: [],
        isLoading: false,
      });
    }
  },

  fetchAnalytics: async (days = 7, type = 'advertiser') => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getAnalytics({ days, type });
      const overview = response.data?.overview;
      set({
        revenueData: overview?.revenue || [],
        ctrData: overview?.ctr || [],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch analytics',
        revenueData: [],
        ctrData: [],
        isLoading: false,
      });
    }
  },

  deleteAd: async (adId: string) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteAd(adId);
      set((state) => ({
        ads: state.ads.filter((ad) => ad.id !== adId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete ad',
        isLoading: false,
      });
    }
  },

  deleteBot: async (botId: string) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteBot(botId);
      set((state) => ({
        bots: state.bots.filter((bot) => bot.id !== botId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete bot',
        isLoading: false,
      });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.updateProfile(data);
      set({
        profile: response.data.user,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update profile',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));