// src/store/adStore.ts
import { create } from 'zustand';
import type { Ad, CreateAdRequest, PricingEstimate, TargetingOptions } from '../types/ad.types';
import adService from '../services/ad.service';

interface AdFormData extends Partial<CreateAdRequest> {
  contentType: 'TEXT' | 'HTML' | 'MARKDOWN' | 'MEDIA' | 'POLL';
  title: string;
  text: string;
  buttons: Array<{ text: string; url: string }>;
  mediaUrl?: string;
  mediaFile?: File;
  targetImpressions: number;
  targeting: {
    categories?: string[];
    aiSegments?: string[];
    languages?: string[];
    frequency?: string;
  };
  cpmBid?: number;
  promoCode?: string;
}

interface AdState {
  formData: AdFormData;
  currentStep: number;
  ads: Ad[];
  currentAd: Ad | null;
  pricingEstimate: PricingEstimate | null;
  targetingOptions: TargetingOptions | null;
  dailyStats: any[] | null;
  hourlyStats: any[] | null;
  overviewStats: any[] | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
}

interface AdActions {
  updateFormData: (data: Partial<AdFormData>) => void;
  setStep: (step: number) => void;
  resetForm: () => void;
  fetchPricingEstimate: () => Promise<void>;
  fetchTargetingOptions: () => Promise<void>;
  createAd: () => Promise<boolean>;
  fetchMyAds: (params?: any) => Promise<void>;
  fetchAdById: (adId: string) => Promise<void>;
  updateAd: (adId: string, data: Partial<CreateAdRequest>) => Promise<void>;
  submitAd: (adId: string) => Promise<void>;
  pauseAd: (adId: string) => Promise<void>;
  resumeAd: (adId: string) => Promise<void>;
  deleteAd: (adId: string) => Promise<void>;
  toggleSaveAd: (adId: string) => Promise<void>;
  archiveAd: (adId: string) => Promise<void>;
  unarchiveAd: (adId: string) => Promise<void>;
  setSchedule: (adId: string, scheduleData: any) => Promise<void>;
  removeSchedule: (adId: string) => Promise<void>;
  sendTestAd: (adId: string, telegramUserId: string) => Promise<void>;
  fetchDailyStats: (adId: string, days?: number) => Promise<any>;
  fetchHourlyStats: (adId: string) => Promise<any>;
  fetchOverviewStats: (days?: number) => Promise<any>;
  clearError: () => void;
  clearSuccess: () => void;
}

const initialFormData: AdFormData = {
  contentType: 'TEXT',
  title: '',
  text: '',
  buttons: [],
  targetImpressions: 1000,
  targeting: {
    languages: ['uz', 'ru', 'en'],
    frequency: 'unique',
  },
};

let pricingDebounceTimer: NodeJS.Timeout | null = null;

export const useAdStore = create<AdState & AdActions>((set, get) => ({
  formData: initialFormData,
  currentStep: 0,
  ads: [],
  currentAd: null,
  pricingEstimate: null,
  targetingOptions: null,
  dailyStats: null,
  hourlyStats: null,
  overviewStats: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  successMessage: null,

  updateFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
    
    if (data.targetImpressions !== undefined || data.targeting !== undefined) {
      if (pricingDebounceTimer) {
        clearTimeout(pricingDebounceTimer);
      }
      
      pricingDebounceTimer = setTimeout(() => {
        get().fetchPricingEstimate();
      }, 500);
    }
  },

  setStep: (step) => set({ currentStep: step }),
  
  resetForm: () => set({ 
    formData: initialFormData, 
    currentStep: 0,
    error: null,
    successMessage: null,
  }),

  fetchPricingEstimate: async () => {
    const { formData } = get();
    
    try {
      const response = await adService.getPricingEstimate({
        impressions: formData.targetImpressions,
        targeting: formData.targeting,
        cpmBid: formData.cpmBid,
      });
      
      set({ pricingEstimate: response.data.estimate });
    } catch (error: any) {
      console.error('Failed to fetch pricing:', error);
    }
  },

  fetchTargetingOptions: async () => {
    try {
      const response = await adService.getTargetingOptions();
      set({ targetingOptions: response.data.options });
    } catch (error: any) {
      console.error('Failed to fetch targeting options:', error);
    }
  },

  createAd: async () => {
    set({ isSubmitting: true, error: null });
    
    try {
      const { formData } = get();
      
      const response = await adService.createAd({
        contentType: formData.contentType,
        text: formData.text,
        buttons: formData.buttons,
        mediaUrl: formData.mediaUrl,
        targetImpressions: formData.targetImpressions,
        targeting: formData.targeting,
        cpmBid: formData.cpmBid,
        promoCode: formData.promoCode,
        trackingEnabled: true,
      });
      
      set({
        currentAd: response.data.ad,
        isSubmitting: false,
        successMessage: 'Ad created successfully!',
      });
      
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create ad',
        isSubmitting: false,
      });
      return false;
    }
  },

  fetchMyAds: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await adService.getMyAds(params);
      set({
        ads: response.data || [],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch ads',
        isLoading: false,
      });
    }
  },

  fetchAdById: async (adId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await adService.getAdById(adId);
      set({
        currentAd: response.data.ad,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch ad',
        isLoading: false,
      });
    }
  },

  updateAd: async (adId, data) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const response = await adService.updateAd(adId, data);
      
      set((state) => ({
        ads: state.ads.map((ad) => (ad.id === adId ? response.data.ad : ad)),
        currentAd: state.currentAd?.id === adId ? response.data.ad : state.currentAd,
        isSubmitting: false,
        successMessage: 'Ad updated successfully!',
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update ad',
        isSubmitting: false,
      });
    }
  },

  submitAd: async (adId) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const response = await adService.submitAd(adId);
      
      set((state) => ({
        ads: state.ads.map((ad) => (ad.id === adId ? response.data.ad : ad)),
        isSubmitting: false,
        successMessage: 'Ad submitted for review!',
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to submit ad',
        isSubmitting: false,
      });
    }
  },

  pauseAd: async (adId) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const response = await adService.pauseAd(adId);
      
      set((state) => ({
        ads: state.ads.map((ad) => (ad.id === adId ? response.data.ad : ad)),
        isSubmitting: false,
        successMessage: 'Ad paused!',
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to pause ad',
        isSubmitting: false,
      });
    }
  },

  resumeAd: async (adId) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const response = await adService.resumeAd(adId);
      
      set((state) => ({
        ads: state.ads.map((ad) => (ad.id === adId ? response.data.ad : ad)),
        isSubmitting: false,
        successMessage: 'Ad resumed!',
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to resume ad',
        isSubmitting: false,
      });
    }
  },

  // ✅ FIXED - RETURNS DUPLICATED AD
  duplicateAd: async (adId) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const response = await adService.duplicateAd(adId);
      const duplicatedAd = response.data.ad;
      
      set((state) => ({
        ads: [duplicatedAd, ...state.ads],
        isSubmitting: false,
        successMessage: 'Ad duplicated!',
      }));
      
      return duplicatedAd;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to duplicate ad',
        isSubmitting: false,
      });
      return null;
    }
  },

  deleteAd: async (adId) => {
    set({ isSubmitting: true, error: null });
    
    try {
      await adService.deleteAd(adId);
      
      set((state) => ({
        ads: state.ads.filter((ad) => ad.id !== adId),
        isSubmitting: false,
        successMessage: 'Ad deleted!',
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete ad',
        isSubmitting: false,
      });
    }
  },

  toggleSaveAd: async (adId) => {
    try {
      const response = await adService.toggleSaveAd(adId);
      
      set((state) => ({
        ads: state.ads.map((ad) => 
          ad.id === adId 
            ? { ...ad, isSaved: response.data.saved } 
            : ad
        ),
        successMessage: response.data.saved ? 'Ad saved!' : 'Ad unsaved!',
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to save ad',
      });
    }
  },

  archiveAd: async (adId) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const response = await adService.archiveAd(adId);
      
      set((state) => ({
        ads: state.ads.map((ad) => (ad.id === adId ? response.data.ad : ad)),
        isSubmitting: false,
        successMessage: 'Ad archived!',
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to archive ad',
        isSubmitting: false,
      });
    }
  },

  unarchiveAd: async (adId) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const response = await adService.unarchiveAd(adId);
      
      set((state) => ({
        ads: state.ads.map((ad) => (ad.id === adId ? response.data.ad : ad)),
        isSubmitting: false,
        successMessage: 'Ad unarchived!',
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to unarchive ad',
        isSubmitting: false,
      });
    }
  },

  setSchedule: async (adId, scheduleData) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const response = await adService.setSchedule(adId, scheduleData);
      
      set((state) => ({
        ads: state.ads.map((ad) => (ad.id === adId ? response.data.ad : ad)),
        isSubmitting: false,
        successMessage: 'Schedule set successfully!',
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to set schedule',
        isSubmitting: false,
      });
    }
  },

  removeSchedule: async (adId) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const response = await adService.removeSchedule(adId);
      
      set((state) => ({
        ads: state.ads.map((ad) => (ad.id === adId ? response.data.ad : ad)),
        isSubmitting: false,
        successMessage: 'Schedule removed!',
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to remove schedule',
        isSubmitting: false,
      });
    }
  },

  sendTestAd: async (adId, telegramUserId) => {
    set({ isSubmitting: true, error: null });
    
    try {
      await adService.sendTestAd(adId, telegramUserId);
      
      set({
        isSubmitting: false,
        successMessage: 'Test ad sent to Telegram!',
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to send test ad',
        isSubmitting: false,
      });
    }
  },

  fetchDailyStats: async (adId, days = 30) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await adService.getDailyStats(adId, days);
      
      set({
        dailyStats: response.data.stats,
        isLoading: false,
      });
      
      return response.data.stats;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch daily stats',
        isLoading: false,
      });
      return null;
    }
  },

  fetchHourlyStats: async (adId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await adService.getHourlyStats(adId);
      
      set({
        hourlyStats: response.data.stats,
        isLoading: false,
      });
      
      return response.data.stats;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch hourly stats',
        isLoading: false,
      });
      return null;
    }
  },

  fetchOverviewStats: async (days = 30) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await adService.getOverviewStats(days);
      
      set({
        overviewStats: response.data.stats,
        isLoading: false,
      });
      
      return response.data.stats;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch overview stats',
        isLoading: false,
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ successMessage: null }),
}));