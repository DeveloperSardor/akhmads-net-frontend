// src/types/bot.types.ts - FIXED WITH ANALYTICS FIELDS

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
  
  avatarUrl?: string;
  botstatData?: any;
  
  // ✅ ANALYTICS FIELDS
  impressionsServed?: number;
  clicks?: number;
  ctr?: number;
  
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
  icon: string;
}

export const BOT_CATEGORIES: BotCategory[] = [
  { id: 'music', nameUz: 'Musiqa', nameRu: 'Музыка', nameEn: 'Music', icon: '🎵' },
  { id: 'download', nameUz: 'Yuklab olish', nameRu: 'Скачивалки', nameEn: 'Downloads', icon: '📥' },
  { id: 'tools', nameUz: 'Asboblar', nameRu: 'Инструменты', nameEn: 'Tools', icon: '🛠' },
  { id: 'chat', nameUz: 'Chat va tanishuvlar', nameRu: 'Чаты и знакомства', nameEn: 'Chats & Dating', icon: '💬' },
  { id: 'gdz', nameUz: 'GDZ', nameRu: 'ГДЗ', nameEn: 'Homework Help', icon: '📚' },
  { id: 'vpn', nameUz: 'VPN / Proksi', nameRu: 'VPN / Proxy', nameEn: 'VPN / Proxy', icon: '🔒' },
  { id: 'movies', nameUz: 'Filmlar', nameRu: 'Фильмы', nameEn: 'Movies', icon: '🎬' },
  { id: 'tests', nameUz: 'Testlar', nameRu: 'Тесты', nameEn: 'Tests', icon: '📝' },
  { id: 'currency', nameUz: 'Valyuta kurslari', nameRu: 'Курсы валют', nameEn: 'Currency Rates', icon: '💱' },
  { id: 'games', nameUz: 'O\'yinlar', nameRu: 'Игры', nameEn: 'Games', icon: '🎮' },
  { id: 'stickers', nameUz: 'Stikerlar', nameRu: 'Стикеры', nameEn: 'Stickers', icon: '🎨' },
  { id: 'ai', nameUz: 'AI / Neyrotarmoqlar', nameRu: 'AI / Нейросети', nameEn: 'AI / Neural Networks', icon: '🤖' },
  { id: 'voice', nameUz: 'Ovozli', nameRu: 'Голосовые', nameEn: 'Voice', icon: '🎙' },
  { id: 'fitness', nameUz: 'Fitnes / Salomatlik', nameRu: 'Фитнес / Здоровье', nameEn: 'Fitness / Health', icon: '💪' },
  { id: 'group', nameUz: 'Guruh-botlar', nameRu: 'Групповые / Чат-боты', nameEn: 'Group / Chat Bots', icon: '👥' },
  { id: 'books', nameUz: 'Kitoblar', nameRu: 'Книги', nameEn: 'Books', icon: '📖' },
  { id: 'themes', nameUz: 'Temalar', nameRu: 'Темы', nameEn: 'Themes', icon: '🎭' },
  { id: 'converter', nameUz: 'Fayl konverterlari', nameRu: 'Конвертеры файлов', nameEn: 'File Converters', icon: '🔄' },
  { id: 'horoscope', nameUz: 'Goroskoplar', nameRu: 'Гороскопы', nameEn: 'Horoscopes', icon: '🔮' },
  { id: 'other', nameUz: 'Boshqa', nameRu: 'Другое', nameEn: 'Other', icon: '📌' },
];

export const BOT_LANGUAGES = [
  { code: 'uz', name: 'O\'zbekcha' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
];