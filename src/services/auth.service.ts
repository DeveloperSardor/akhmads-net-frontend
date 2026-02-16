import apiClient from '../api/api';
import type{
  LoginInitiateResponse,
  LoginStatusResponse,
  RefreshTokenResponse,
  MeResponse,
} from '../types/auth.types';

class AuthService {
  /**
   * 1️⃣ Initiate Login - Telegram login boshlash
   */
  async initiateLogin(): Promise<LoginInitiateResponse> {
    const response = await apiClient.post<LoginInitiateResponse>(
      '/auth/login/initiate'
    );
    return response.data;
  }

  /**
   * 2️⃣ Check Login Status - Polling uchun
   */
  async checkLoginStatus(loginToken: string): Promise<LoginStatusResponse> {
    const response = await apiClient.get<LoginStatusResponse>(
      `/auth/login/status/${loginToken}`
    );
    return response.data;
  }

  /**
   * 3️⃣ Get Current User - Token bilan user ma'lumotlarini olish
   */
  async getCurrentUser(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return response.data;
  }

  /**
   * 4️⃣ Refresh Token - Access token yangilash
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  }

  /**
   * 5️⃣ Logout - Tizimdan chiqish
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  /**
   * 🔐 Set Auth Token - Header ga token qo'yish
   */
  setAuthToken(token: string | null): void {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }
}

export default new AuthService();