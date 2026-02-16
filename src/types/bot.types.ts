// Bot related types

export interface Bot {
  id: string;
  ownerId: string;
  telegramBotId: string;
  username: string;
  firstName: string;
  shortDescription?: string;
  category: string;
  language: string;
  
  totalMembers: number;
  activeMembers: number;
  
  monetized: boolean;
  isPaused: boolean;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'BANNED' | 'PAUSED';
  
  postFilter: string;
  allowedCategories?: string[];
  blockedCategories?: string[];
  frequencyMinutes: number;
  
  totalEarnings: number;
  pendingEarnings: number;
  currentEcpm: number;
  
  apiKey?: string;
  apiKeyRevoked: boolean;
  
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterBotRequest {
  token: string;
  shortDescription?: string;
  category: string;
  language: string;
  monetized?: boolean;
}

export interface RegisterBotResponse {
  success: boolean;
  data: {
    bot: Bot;
    apiKey: string;
  };
  message: string;
}

export interface GetBotsResponse {
  success: boolean;
  data: Bot[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateBotRequest {
  shortDescription?: string;
  category?: string;
  language?: string;
  monetized?: boolean;
  isPaused?: boolean;
  postFilter?: string;
  allowedCategories?: string[];
  blockedCategories?: string[];
  frequencyMinutes?: number;
}

export interface DeleteBotResponse {
  success: boolean;
  message: string;
}

export interface BotCategory {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
}

export const BOT_CATEGORIES: BotCategory[] = [
  { id: 'technology', nameUz: 'Texnologiya', nameRu: 'Технология', nameEn: 'Technology' },
  { id: 'education', nameUz: 'Ta\'lim', nameRu: 'Образование', nameEn: 'Education' },
  { id: 'news', nameUz: 'Yangiliklar', nameRu: 'Новости', nameEn: 'News' },
  { id: 'entertainment', nameUz: 'Ko\'ngilochar', nameRu: 'Развлечения', nameEn: 'Entertainment' },
  { id: 'music', nameUz: 'Musiqa', nameRu: 'Музыка', nameEn: 'Music' },
  { id: 'download', nameUz: 'Yuklab olish', nameRu: 'Скачивалки', nameEn: 'Downloads' },
  { id: 'shopping', nameUz: 'Xarid', nameRu: 'Покупки', nameEn: 'Shopping' },
  { id: 'finance', nameUz: 'Moliya', nameRu: 'Финансы', nameEn: 'Finance' },
];

export const BOT_LANGUAGES = [
  { code: 'uz', name: 'O\'zbekcha' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
];