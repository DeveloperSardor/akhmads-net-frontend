// auth.types.ts

export interface User {
  id: string;
  telegramId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  role: string;
  locale: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginInitiateResponse {
  success: boolean;
  data: {
    loginToken: string;
    deepLink: string;
    code: string;        // ✅ Browser shows this
    codes: string[];     // ✅ Bot shows all 4
    expiresAt: string;
    expiresIn: number;
  };
}


export interface LoginStatusResponse {
  success: boolean;
  data: {
    authorized: boolean;
    expired?: boolean;
    tokens?: AuthTokens;
    user?: User;
  };
}

export interface MeResponse {
  success: boolean;
  data: User;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    tokens: AuthTokens;
  };
}