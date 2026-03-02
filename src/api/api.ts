// src/api/api.ts - CLEAN VERSION
import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.akhmads.net/api/v1';

export const getBotAvatarUrl = (username: string) =>
  `${API_BASE_URL.replace(/\/$/, '')}/bots/avatar/@${username}`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ❌ NO INTERCEPTORS HERE - interceptors.ts handles it!

export default apiClient;