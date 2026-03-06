import { create } from "zustand";
import type {
  Bot,
  RegisterBotRequest,
  UpdateBotRequest,
} from "../types/bot.types";
import botService from "../services/bot.service";

interface BotState {
  // Data
  bots: Bot[];
  currentBot: Bot | null;

  // UI State
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  history: any[]; // Bot ad history
  audience: any[]; // Bot unique users
  audienceStats: any;
}

interface BotActions {
  registerBot: (
    data: RegisterBotRequest,
  ) => Promise<{ bot: Bot; apiKey: string } | null>;
  fetchMyBots: (params?: { status?: string; limit?: number }) => Promise<void>;
  fetchBotById: (botId: string) => Promise<void>;
  fetchBotHistory: (botId: string) => Promise<void>;
  fetchBotUsers: (botId: string, params?: any) => Promise<void>;
  updateBot: (botId: string, data: UpdateBotRequest) => Promise<void>;
  deleteBot: (botId: string) => Promise<void>;
  togglePause: (botId: string, isPaused: boolean) => Promise<void>;
  regenerateApiKey: (botId: string) => Promise<string | null>;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useBotStore = create<BotState & BotActions>((set) => ({
  // Initial State
  bots: [],
  currentBot: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  successMessage: null,
  history: [],
  audience: [],
  audienceStats: null,

  /**
   * 🤖 Register Bot
   */
  registerBot: async (data) => {
    set({ isSubmitting: true, error: null, successMessage: null });
    try {
      const response = await botService.registerBot(data);

      // ✅ Backend returns { bot, apiKey } directly in data field
      const bot = response.data.bot || response.data;
      const apiKey = response.data.apiKey || "";

      // Add to bots list
      set((state) => ({
        bots: [bot, ...state.bots],
        isSubmitting: false,
        successMessage: "Bot registered successfully!",
      }));

      return { bot, apiKey };
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to register bot",
        isSubmitting: false,
      });
      return null;
    }
  },

  /**
   * 📋 Fetch My Bots
   * ✅ Maps backend response correctly
   */
  fetchMyBots: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await botService.getMyBots(params);

      // ✅ Backend returns { bots: [...] }
      const botsData = (response.data as any).bots || response.data || [];

      set({
        bots: botsData,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch bots",
        isLoading: false,
      });
    }
  },

  /**
   * 🔍 Fetch Bot By ID
   */
  fetchBotById: async (botId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await botService.getBotById(botId);
      set({
        currentBot: (response.data as any).bot || response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch bot",
        isLoading: false,
      });
    }
  },

  /**
   * 📜 Fetch Bot History
   */
  fetchBotHistory: async (botId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await botService.getBotHistory(botId);
      set({
        history: response.data.history || [],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch bot history",
        isLoading: false,
      });
    }
  },

  /**
   * 👥 Fetch Bot Users (Audience)
   */
  fetchBotUsers: async (botId, params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await botService.getBotUsers(botId, params);
      set({
        audience: response.data || [],
        audienceStats: response.pagination?.stats || null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch bot audience",
        isLoading: false,
      });
    }
  },

  /**
   * ✏️ Update Bot
   */
  updateBot: async (botId, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await botService.updateBot(botId, data);
      const updatedBot = (response.data as any).bot || response.data;

      // Update in list
      set((state) => ({
        bots: state.bots.map((bot) => (bot.id === botId ? updatedBot : bot)),
        currentBot:
          state.currentBot?.id === botId ? updatedBot : state.currentBot,
        isSubmitting: false,
        successMessage: "Bot updated successfully!",
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update bot",
        isSubmitting: false,
      });
    }
  },

  /**
   * 🗑️ Delete Bot
   */
  deleteBot: async (botId) => {
    set({ isSubmitting: true, error: null });
    try {
      await botService.deleteBot(botId);

      // Remove from list
      set((state) => ({
        bots: state.bots.filter((bot) => bot.id !== botId),
        isSubmitting: false,
        successMessage: "Bot deleted successfully!",
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete bot",
        isSubmitting: false,
      });
    }
  },

  /**
   * ⏸️ Toggle Pause
   * ✅ FIXED: POST instead of PATCH
   */
  togglePause: async (botId, isPaused) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await botService.toggleBotPause(botId, isPaused);
      const updatedBot = (response.data as any).bot || response.data;

      // Update in list
      set((state) => ({
        bots: state.bots.map((bot) => (bot.id === botId ? updatedBot : bot)),
        isSubmitting: false,
        successMessage: isPaused ? "Bot paused" : "Bot resumed",
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to toggle pause",
        isSubmitting: false,
      });
    }
  },

  /**
   * 🔑 Regenerate API Key
   */
  regenerateApiKey: async (botId) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await botService.regenerateApiKey(botId);
      const apiKey = response.data.apiKey || "";

      set({
        isSubmitting: false,
        successMessage: "API key regenerated successfully!",
      });
      return apiKey;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to regenerate API key",
        isSubmitting: false,
      });
      return null;
    }
  },

  /**
   * 🧹 Clear Error
   */
  clearError: () => set({ error: null }),

  /**
   * 🧹 Clear Success
   */
  clearSuccess: () => set({ successMessage: null }),
}));
