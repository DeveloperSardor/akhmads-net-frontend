// src/api/api.ts - CLEAN VERSION
import axios from 'axios';

const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || 'https://api.akhmads.net/api/v1',
  baseURL: "https://api.akhmads.net/api/v1" || import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ❌ NO INTERCEPTORS HERE - interceptors.ts handles it!

export default apiClient;