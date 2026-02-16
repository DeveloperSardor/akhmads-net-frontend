import apiClient from '../api/api';
import type {
  UserProfileResponse,
  UserAdsResponse,
  UserBotsResponse,
  AnalyticsResponse,
} from '../types/user.types';

class UserService {
  /**
   * 👤 Get User Profile - User ma'lumotlari, wallet va stats
   */
  async getProfile(): Promise<UserProfileResponse> {
    const response = await apiClient.get<UserProfileResponse>('/user/profile');
    return response.data;
  }

  /**
   * ✏️ Update Profile - User ma'lumotlarini yangilash
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    locale?: string;
  }): Promise<UserProfileResponse> {
    const response = await apiClient.put<UserProfileResponse>('/user/profile', data);
    return response.data;
  }

  /**
   * 📊 Get User Ads - Foydalanuvchi e'lonlari
   */
  async getUserAds(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<UserAdsResponse> {
    const response = await apiClient.get<UserAdsResponse>('/ads', { params });
    return response.data;
  }

  /**
   * 🤖 Get User Bots - Foydalanuvchi botlari
   */
  async getUserBots(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<UserBotsResponse> {
    const response = await apiClient.get<UserBotsResponse>('/bots', { params });
    return response.data;
  }

  /**
   * 📈 Get Analytics - Revenue va CTR grafiklari uchun
   */
  async getAnalytics(params: {
    days?: number;
    type: 'advertiser' | 'owner';
  }): Promise<AnalyticsResponse> {
    const endpoint = params.type === 'advertiser' 
      ? '/analytics/advertiser/overview'
      : '/analytics/owner/overview';
    
    const response = await apiClient.get<AnalyticsResponse>(endpoint, {
      params: { days: params.days || 7 }
    });
    return response.data;
  }

  /**
   * 🗑️ Delete Ad - E'lonni o'chirish
   */
  async deleteAd(adId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/ads/${adId}`);
    return response.data;
  }

  /**
   * 🗑️ Delete Bot - Botni o'chirish
   */
  async deleteBot(botId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/bots/${botId}`);
    return response.data;
  }
}

export default new UserService();