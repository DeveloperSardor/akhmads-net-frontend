import apiClient from '../api/api';
import type {
  Bot,
  RegisterBotRequest,
  RegisterBotResponse,
  GetBotsResponse,
  UpdateBotRequest,
  DeleteBotResponse,
} from '../types/bot.types';

class BotService {
  /**
   * 🤖 Register Bot - Botni ro'yxatdan o'tkazish
   */
  async registerBot(data: RegisterBotRequest): Promise<RegisterBotResponse> {
    const response = await apiClient.post<RegisterBotResponse>('/bots', data);
    return response.data;
  }

  /**
   * ✅ Verify Bot Token - Preview info before registration
   */
  async verifyBotToken(token: string): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.post<{ success: boolean; data: any }>('/bots/verify-token', { token });
    return response.data;
  }

  /**
   * 📋 Get My Bots - Foydalanuvchi botlari
   */
  async getMyBots(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<GetBotsResponse> {
    const response = await apiClient.get<GetBotsResponse>('/bots', { params });
    return response.data;
  }

  /**
   * 🔍 Get Bot By ID - Bitta botni olish
   */
  async getBotById(botId: string): Promise<{ success: boolean; data: Bot }> {
    const response = await apiClient.get<{ success: boolean; data: Bot }>(`/bots/${botId}`);
    return response.data;
  }

  /**
   * ✏️ Update Bot - Botni yangilash
   */
  async updateBot(botId: string, data: UpdateBotRequest): Promise<{ success: boolean; data: Bot }> {
    const response = await apiClient.put<{ success: boolean; data: Bot }>(`/bots/${botId}`, data);
    return response.data;
  }

  /**
   * 🗑️ Delete Bot - Botni o'chirish
   */
  async deleteBot(botId: string): Promise<DeleteBotResponse> {
    const response = await apiClient.delete<DeleteBotResponse>(`/bots/${botId}`);
    return response.data;
  }

  /**
   * ⏸️ Pause/Resume Bot - Botni to'xtatish/davom ettirish
   * ✅ FIXED: POST instead of PATCH
   */
  async toggleBotPause(botId: string, isPaused: boolean): Promise<{ success: boolean; data: Bot }> {
    const response = await apiClient.post<{ success: boolean; data: Bot }>(
      `/bots/${botId}/pause`,
      { isPaused }
    );
    return response.data;
  }

  /**
   * 🔑 Regenerate API Key - API key'ni qayta yaratish
   * ✅ FIXED: Correct endpoint path
   */
  async regenerateApiKey(botId: string): Promise<{ success: boolean; data: { apiKey: string } }> {
    const response = await apiClient.post<{ success: boolean; data: { apiKey: string } }>(
      `/bots/${botId}/regenerate-api-key`
    );
    return response.data;
  }

  /**
   * 📊 Get Bot Stats - Bot statistikasi
   */
  async getBotStats(botId: string, period: '7d' | '30d' | '90d' = '7d'): Promise<{
    success: boolean;
    data: {
      bot: Bot;
      period: number;
      totalImpressions: number;
      totalRevenue: number;
      dailyStats: Array<{
        date: string;
        impressions: number;
        uniqueUsers: number;
        clicks: number;
        revenue: number;
        ecpm: number;
      }>;
    };
  }> {
    const response = await apiClient.get(`/bots/${botId}/stats`, {
      params: { period },
    });
    return response.data;
  }

  /**
   * 📜 Get Bot History - Bot reklamalar tarixi
   */
  async getBotHistory(botId: string): Promise<{
    success: boolean;
    data: {
      history: Array<{
        id: string;
        adId: string;
        botId: string;
        telegramUserId: string;
        firstName: string;
        lastName: string;
        username: string;
        revenue: string;
        botOwnerEarns: string;
        createdAt: string;
        ad: {
          title: string;
          text: string;
          mediaUrl: string;
        };
      }>;
    };
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        history: Array<{
          id: string;
          adId: string;
          botId: string;
          telegramUserId: string;
          firstName: string;
          lastName: string;
          username: string;
          revenue: string;
          botOwnerEarns: string;
          createdAt: string;
          ad: {
            title: string;
            text: string;
            mediaUrl: string;
          };
        }>;
      };
    }>(`/bots/${botId}/history`);
    return response.data;
  }
}

export default new BotService();