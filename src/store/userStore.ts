// ========================================
// 📁 userStore.ts - FIXED VERSION
// ========================================

import { create } from 'zustand';
import type { User, Wallet, UserStats, Ad, Bot, RevenueData, CtrData } from '../types/user.types';
import userService from '../services/user.service';

interface UserState {
  // Profile data
  profile: User | null;
  wallet: Wallet | null;
  stats: UserStats | null;
  
  // Ads & Bots
  ads: Ad[];
  bots: Bot[];
  
  // Analytics
  revenueData: RevenueData[];
  ctrData: CtrData[];
  
  // UI State
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

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  // Initial State
  profile: null,
  wallet: null,
  stats: null,
  ads: [],
  bots: [],
  revenueData: [],
  ctrData: [],
  isLoading: false,
  error: null,

  /**
   * 👤 Fetch Profile - User, wallet, stats
   */
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getProfile();
      set({
        profile: response.data.user,
        wallet: response.data.wallet,
        stats: response.data.stats,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch profile',
        isLoading: false,
      });
    }
  },

  /**
   * 📊 Fetch Ads - E'lonlarni olish
   * ✅ FIXED: response.data.ads instead of response.data
   */
  fetchAds: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUserAds(params);
      set({
        ads: response.data.ads || [], // ✅ Changed from response.data
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch ads',
        ads: [], // ✅ Reset to empty array on error
        isLoading: false,
      });
    }
  },

  /**
   * 🤖 Fetch Bots - Botlarni olish
   * ✅ FIXED: response.data.bots instead of response.data
   */
  fetchBots: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUserBots(params);
      
      // ✅ Transform backend data to match frontend expectations
      const transformedBots = (response.data.bots || []).map(bot => ({
        ...bot,
        subscribers: bot.totalMembers || 0,
        earnings: typeof bot.totalEarnings === 'string' 
          ? parseFloat(bot.totalEarnings) 
          : bot.totalEarnings || 0,
        impressionsServed: bot.impressionsServed || 0,
      }));

      set({
        bots: transformedBots, // ✅ Changed from response.data
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch bots',
        bots: [], // ✅ Reset to empty array on error
        isLoading: false,
      });
    }
  },

  /**
   * 📈 Fetch Analytics - Revenue va CTR ma'lumotlari
   */
  fetchAnalytics: async (days = 7, type = 'advertiser') => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getAnalytics({ days, type });
      set({
        revenueData: response.data.revenue || [],
        ctrData: response.data.ctr || [],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch analytics',
        revenueData: [], // ✅ Reset on error
        ctrData: [], // ✅ Reset on error
        isLoading: false,
      });
    }
  },

  /**
   * 🗑️ Delete Ad
   */
  deleteAd: async (adId: string) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteAd(adId);
      
      // Remove from local state
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

  /**
   * 🗑️ Delete Bot
   */
  deleteBot: async (botId: string) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteBot(botId);
      
      // Remove from local state
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

  /**
   * ✏️ Update Profile
   */
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
      throw error; // Re-throw to handle in component
    }
  },

  /**
   * 🧹 Clear Error
   */
  clearError: () => set({ error: null }),
}));