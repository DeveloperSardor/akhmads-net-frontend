// Ad Types
export type AdContentType = 'TEXT' | 'HTML' | 'MARKDOWN' | 'MEDIA' | 'POLL';
export type AdStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export interface Ad {
  id: string;
  advertiserId: string;
  contentType: AdContentType;
  title: string;
  text: string;
  htmlContent?: string;
  markdownContent?: string;
  mediaUrl?: string;
  mediaType?: string;
  buttons?: AdButton[];
  poll?: AdPoll;
  targetImpressions: number;
  deliveredImpressions: number;
  clicks: number;
  ctr: number;
  baseCpm: number;
  cpmBid: number;
  finalCpm: number;
  totalCost: number;
  platformFee: number;
  botOwnerRevenue: number;
  remainingBudget: number;
  status: AdStatus;
  targeting?: AdTargeting;
  specificBotIds?: string[];
  promoCodeUsed?: string;
  discount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AdButton {
  text: string;
  url: string;
}

export interface AdPoll {
  question: string;
  options: string[];
  allowsMultipleAnswers?: boolean;
  isAnonymous?: boolean;
}

export interface AdTargeting {
  categories?: string[];
  aiSegments?: string[];
  languages?: string[];
  frequency?: 'unique' | 'daily' | 'weekly' | 'monthly';
}

export interface PricingTier {
  id: string;
  name: string;
  impressions: number;
  cpmBase: number;
  discount: number;
  isActive: boolean;
  sortOrder: number;
}

export interface PricingEstimate {
  tier: PricingTier;
  pricing: {
    baseCPM: number;
    categoryMultiplier: number;
    targetingMultiplier: number;
    finalCPM: number;
    platformFee: number;
    totalCost: number;
    discount: number;
    botOwnerRevenue: number;
  };
  breakdown: {
    baseCost: number;
    categoryAdjustment: number;
    targetingAdjustment: number;
    subtotal: number;
    discount: number;
    total: number;
  };
}

export interface CreateAdRequest {
  contentType: AdContentType;
  title: string;
  text: string;
  htmlContent?: string;
  markdownContent?: string;
  mediaUrl?: string;
  mediaType?: string;
  buttons?: AdButton[];
  poll?: AdPoll;
  targetImpressions: number;
  cpmBid?: number;
  targeting?: AdTargeting;
  specificBotIds?: string[];
  promoCode?: string;
  trackingEnabled?: boolean;
}

export interface AISegment {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  description: string;
  multiplier: number;
}

export interface TargetingOptions {
  categories: Array<{
    id: string;
    name: { uz: string; ru: string; en: string };
    multiplier: number;
  }>;
  aiSegments: AISegment[];
  languages: string[];
  frequencies: string[];
}

export interface AdPerformance {
  ad: {
    id: string;
    title: string;
    status: AdStatus;
    targetImpressions: number;
    deliveredImpressions: number;
    clicks: number;
    ctr: number;
    totalCost: number;
    remainingBudget: number;
  };
  botBreakdown: Array<{
    bot: {
      id: string;
      username: string;
      firstName: string;
      totalMembers: number;
    };
    impressions: number;
    revenue: number;
  }>;
  totalClicks: number;
}