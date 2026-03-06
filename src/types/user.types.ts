// src/types/user.types.ts

export interface User {
  id: string;
  telegramId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  role: "ADVERTISER" | "BOT_OWNER" | "ADMIN" | "MODERATOR" | "SUPER_ADMIN";
  roles?: string[];
  displayRole?: string;
  locale: string;
  twoFactorEnabled: boolean;
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
  totalEarnings?: string | number;
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
  advertiserId: string;
  contentType: string;
  title: string;
  text?: string;
  mediaUrl?: string;
  buttons?: string | any[];
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "APPROVED"
    | "RUNNING"
    | "PAUSED"
    | "COMPLETED"
    | "REJECTED"
    | "ARCHIVED";
  deliveredImpressions: number;
  uniqueViews: number;
  clicks: number;
  conversions: number;
  ctr: string | number;
  totalCost?: string | number;
  remainingBudget?: string | number;
  targetImpressions?: number;
  isArchived: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
  // Legacy/computed fields for compatibility
  impressions?: number;
  spent?: number;
  conversionRate?: number;
}

export interface Bot {
  id: string;
  username: string;
  firstName: string;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "BANNED" | "PAUSED";
  totalMembers: number;
  subscribers: number;
  impressionsServed: number;
  totalEarnings: string | number;
  earnings: number;
  clicks: number;
  ctr: string | number;
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

// API Response Types

export interface UserProfileResponse {
  success: boolean;
  data: {
    user: User;
    wallet: Wallet;
    stats: UserStats;
  };
  timestamp: string;
}

// Real response: { success, data: [...], pagination }
export interface UserAdsResponse {
  success: boolean;
  message?: string;
  data: Ad[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface UserBotsResponse {
  success: boolean;
  message?: string;
  data: Bot[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    overview: {
      wallet: { available: number; reserved: number; totalSpent: number };
      ads: {
        total: number;
        active: number;
        totalImpressions: number;
        totalClicks: number;
        averageCtr: number;
        totalSpent: number;
      };
      revenue: RevenueData[];
      ctr: CtrData[];
    };
  };
  timestamp: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  locale?: string;
}
