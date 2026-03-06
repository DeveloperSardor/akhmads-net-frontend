// src/api/api.ts - CLEAN VERSION
import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.akhmads.net/api/v1";
export const BASE_URL = API_BASE_URL.split("/api/")[0];

export const getBotAvatarUrl = (username: string) => {
  const cleanUsername = username.replace(/^@/, "");
  return `${API_BASE_URL.replace(/\/$/, "")}/bots/avatar/@${cleanUsername}`;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ❌ NO INTERCEPTORS HERE - interceptors.ts handles it!

export default apiClient;
