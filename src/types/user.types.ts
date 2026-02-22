
export interface User {
  id: string;
  telegramId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  role: 'ADVERTISER' | 'BOT_OWNER' | 'ADMIN' | 'MODERATOR' | 'SUPER_ADMIN';
  roles?: string[];
  displayRole?: string;
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
  deliveredImpressions?: number;
  impressions: number;
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
  totalMembers: number;
  subscribers: number;
  impressionsServed: number;
  totalEarnings: string | number;
  earnings: number;
  clicks: number;
  ctr: number;
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

// ✅ FIXED - API Response Types
export interface UserProfileResponse {
  success: boolean;
  data: {
    user: User;
    wallet: Wallet;
    stats: UserStats;
  };
  timestamp: string;
}

export interface UserAdsResponse {
  success: boolean;
  message: string;
  data: {
    ads: Ad[]; // ✅ Changed: ads is nested inside data
  };
  timestamp: string;
}

export interface UserBotsResponse {
  success: boolean;
  message: string;
  data: {
    bots: Bot[]; // ✅ Changed: bots is nested inside data
  };
  timestamp: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    revenue: RevenueData[];
    ctr: CtrData[];
  };
  timestamp: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  locale?: string;
}