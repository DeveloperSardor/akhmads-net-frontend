import apiClient from "../api/api";
import type {
  LoginInitiateResponse,
  LoginStatusResponse,
  RefreshTokenResponse,
  MeResponse,
} from "../types/auth.types";

class AuthService {
  /**
   * 1️⃣ Initiate Login - Telegram login boshlash
   */
  async initiateLogin(): Promise<LoginInitiateResponse> {
    const response = await apiClient.post<LoginInitiateResponse>(
      "/auth/login/initiate",
    );
    return response.data;
  }

  /**
   * 2️⃣ Check Login Status - Polling uchun
   */
  async checkLoginStatus(loginToken: string): Promise<LoginStatusResponse> {
    const response = await apiClient.get<LoginStatusResponse>(
      `/auth/login/status/${loginToken}`,
    );
    return response.data;
  }

  /**
   * 3️⃣ Get Current User - Token bilan user ma'lumotlarini olish
   */
  async getCurrentUser(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>("/auth/me");
    return response.data;
  }

  /**
   * 4️⃣ Refresh Token - Access token yangilash
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/auth/refresh",
      { refreshToken },
    );
    return response.data;
  }

  /**
   * 5️⃣ Logout - Tizimdan chiqish
   */
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  }

  /**
   * 🤖 Telegram Widget Login - Bot URL button orqali avtomatik login
   */
  async telegramWidgetLogin(params: Record<string, string>) {
    const response = await apiClient.post("/auth/telegram-widget", params);
    return response.data;
  }

  /**
   * 🔐 Verify 2FA - 2FA kodini tasdiqlash
   */
  async verify2fa(twoFaToken: string, code: string) {
    const response = await apiClient.post("/auth/2fa/verify", {
      twoFaToken,
      code,
    });
    return response.data;
  }

  /**
   * 🔐 Setup 2FA - 2FA sozlashni boshlash
   */
  async setup2fa() {
    const response = await apiClient.post("/auth/2fa/setup");
    return response.data;
  }

  /**
   * 🔐 Confirm 2FA - 2FA sozlashni yakunlash
   */
  async confirm2fa(secret: string, code: string) {
    const response = await apiClient.post("/auth/2fa/confirm", {
      secret,
      code,
    });
    return response.data;
  }

  /**
   * 🔐 Disable 2FA - 2FA o'chirish
   */
  async disable2fa() {
    const response = await apiClient.delete("/auth/2fa");
    return response.data;
  }

  /**
   * 🔐 Set Auth Token - Header ga token qo'yish
   */
  setAuthToken(token: string | null): void {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }
}

export default new AuthService();
