// src/services/api.ts

// Expo expone las variables EXPO_PUBLIC_* al bundle
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Log para debug

export const api = {
  async post<T = any>(path: string, body: any): Promise<T> {
    const url = `${API_URL}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
    return res.json();
  },

  async get<T = any>(path: string): Promise<T> {
    const url = `${API_URL}${path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
    return res.json();
  },
};