// src/services/ad.service.ts
import apiClient from '../api/api';
import type {
  Ad,
  CreateAdRequest,
  PricingEstimate,
  TargetingOptions,
  AdPerformance,
} from '../types/ad.types';

class AdService {
  /**
   * Get pricing tiers
   */
  async getPricingTiers() {
    const response = await apiClient.get('/ads/pricing');
    return response.data;
  }

  /**
   * Get pricing estimate
   */
  async getPricingEstimate(data: {
    impressions: number;
    category?: string;
    targeting?: any;
    cpmBid?: number;
  }): Promise<{ success: boolean; data: { estimate: PricingEstimate } }> {
    const response = await apiClient.post('/ads/pricing/estimate', data);
    return response.data;
  }

  /**
   * Get targeting options
   */
  async getTargetingOptions(): Promise<{ success: boolean; data: { options: TargetingOptions } }> {
    const response = await apiClient.get('/ads/targeting/options');
    return response.data;
  }

  /**
   * Generate ad preview
   */
  async generatePreview(data: any) {
    const response = await apiClient.post('/ads/preview', data);
    return response.data;
  }

  /**
   * Create ad
   */
  async createAd(data: CreateAdRequest): Promise<{ success: boolean; data: { ad: Ad } }> {
    const response = await apiClient.post('/ads', data);
    return response.data;
  }

  /**
   * Get user's ads
   */
  async getMyAds(params?: {
    status?: string;
    saved?: boolean;
    archived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data: Ad[]; pagination: any }> {
    const response = await apiClient.get('/ads', { params });
    return response.data;
  }

  /**
   * Get ad by ID
   */
  async getAdById(adId: string): Promise<{ success: boolean; data: { ad: Ad } }> {
    const response = await apiClient.get(`/ads/${adId}`);
    return response.data;
  }

  /**
   * Update ad
   */
  async updateAd(adId: string, data: Partial<CreateAdRequest>): Promise<{ success: boolean; data: { ad: Ad } }> {
    const response = await apiClient.put(`/ads/${adId}`, data);
    return response.data;
  }

  /**
   * Submit ad for moderation
   */
  async submitAd(adId: string): Promise<{ success: boolean; data: { ad: Ad } }> {
    const response = await apiClient.post(`/ads/${adId}/submit`);
    return response.data;
  }

  /**
   * Pause ad
   */
  async pauseAd(adId: string): Promise<{ success: boolean; data: { ad: Ad } }> {
    const response = await apiClient.post(`/ads/${adId}/pause`);
    return response.data;
  }

  /**
   * Resume ad
   */
  async resumeAd(adId: string): Promise<{ success: boolean; data: { ad: Ad } }> {
    const response = await apiClient.post(`/ads/${adId}/resume`);
    return response.data;
  }

  /**
   * Duplicate ad
   */
//   async duplicateAd(adId: string): Promise<{ success: boolean; data: { ad: Ad } }> {
//     const response = await apiClient.post(`/ads/${adId}/duplicate`);
//     return response.data;
//   }

  /**
   * Delete ad
   */
  async deleteAd(adId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/ads/${adId}`);
    return response.data;
  }

  /**
   * ✅ NEW - Toggle save/favorite ad
   */
  async toggleSaveAd(adId: string): Promise<{ success: boolean; data: { saved: boolean } }> {
    const response = await apiClient.post(`/ads/${adId}/save`);
    return response.data;
  }

  /**
   * ✅ NEW - Archive ad
   */
  async archiveAd(adId: string): Promise<{ success: boolean; data: { ad: Ad } }> {
    const response = await apiClient.post(`/ads/${adId}/archive`);
    return response.data;
  }

  /**
   * ✅ NEW - Unarchive ad
   */
  async unarchiveAd(adId: string): Promise<{ success: boolean; data: { ad: Ad } }> {
    const response = await apiClient.post(`/ads/${adId}/unarchive`);
    return response.data;
  }

  /**
   * ✅ NEW - Get saved ads
   */
  async getSavedAds(): Promise<{ success: boolean; data: { ads: Ad[] } }> {
    const response = await apiClient.get('/ads/saved');
    return response.data;
  }

  /**
   * ✅ NEW - Set schedule
   */
  async setSchedule(adId: string, scheduleData: {
    startDate: string;
    endDate: string;
    timezone?: string;
    activeDays?: number[];
    activeHours?: Array<{ start: number; end: number }>;
  }): Promise<{ success: boolean; data: { ad: Ad } }> {
    const response = await apiClient.post(`/ads/${adId}/schedule`, scheduleData);
    return response.data;
  }

  /**
   * ✅ NEW - Remove schedule
   */
  async removeSchedule(adId: string): Promise<{ success: boolean; data: { ad: Ad } }> {
    const response = await apiClient.delete(`/ads/${adId}/schedule`);
    return response.data;
  }

  /**
   * ✅ NEW - Send test ad to Telegram
   */
  async sendTestAd(adId: string, telegramUserId: string): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.post(`/ads/${adId}/test`, { telegramUserId });
    return response.data;
  }

  /**
   * ✅ NEW - Get daily stats
   */
  async getDailyStats(adId: string, days: number = 30): Promise<{ success: boolean; data: { stats: any[] } }> {
    const response = await apiClient.get(`/ads/${adId}/stats/daily`, { params: { days } });
    return response.data;
  }

  /**
   * ✅ NEW - Get hourly distribution
   */
  async getHourlyStats(adId: string): Promise<{ success: boolean; data: { stats: any[] } }> {
    const response = await apiClient.get(`/ads/${adId}/stats/hourly`);
    return response.data;
  }

  /**
   * ✅ NEW - Get advertiser overview stats
   */
  async getOverviewStats(days: number = 30): Promise<{ success: boolean; data: { stats: any[] } }> {
    const response = await apiClient.get('/ads/stats/overview', { params: { days } });
    return response.data;
  }

  /**
   * Get ad performance
   */
  async getAdPerformance(adId: string): Promise<{ success: boolean; data: { performance: AdPerformance } }> {
    const response = await apiClient.get(`/ads/${adId}/performance`);
    return response.data;
  }

  /**
   * Export impressions to Excel
   */
  async exportImpressions(adId: string): Promise<Blob> {
    const response = await apiClient.get(`/ads/${adId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get ad clicks
   */
  async getAdClicks(adId: string, params?: { limit?: number; offset?: number }) {
    const response = await apiClient.get(`/ads/${adId}/clicks`, { params });
    return response.data;
  }
}

export default new AdService();