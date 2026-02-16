export interface User {
  id: string;
  telegramId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  role: 'ADVERTISER' | 'BOT_OWNER' | 'ADMIN' | 'MODERATOR' | 'SUPER_ADMIN';
  roles?: string[]; // ✅ NEW - Multi-role support
  displayRole?: string; // ✅ NEW - Formatted role from backend
  locale: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  available: string | number;
  reserved: string | number;
  pending: string | number;
  totalDeposited: string | number;
  totalWithdrawn: string | number;
  totalEarned: string | number;
  totalSpent: string | number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  totalConversions: number;
  totalSpent: number;
  totalEarned: number;
}

export interface Ad {
  id: string;
  title: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'REJECTED' | 'ARCHIVED';
  deliveredImpressions: number; // ✅ Backend field name
  impressions?: number; // Alias
  clicks: number;
  conversions: number;
  spent: number;
  ctr: number;
  conversionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bot {
  id: string;
  username: string;
  firstName: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'BANNED' | 'PAUSED';
  totalMembers: number; // ✅ Backend field name
  subscribers?: number; // Alias
  impressionsServed?: number; // May not exist in backend
  totalEarnings: number; // ✅ Backend field name
  earnings?: number; // Alias
  ctr?: number;
  category: string;
  language: string;
  createdAt: string;
}

export interface RevenueData {
  date: string;
  earnings: number;
}

export interface CtrData {
  date: string;
  ctr: number;
}

export interface UserProfileResponse {
  success: boolean;
  data: {
    user: User;
    wallet: Wallet;
    stats: UserStats;
  };
}

export interface UserAdsResponse {
  success: boolean;
  data: Ad[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserBotsResponse {
  success: boolean;
  data: Bot[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    revenue: RevenueData[];
    ctr: CtrData[];
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  locale?: string;
}