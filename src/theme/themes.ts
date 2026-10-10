// src/theme/themes.ts

export interface AppTheme {
  id: string;
  label: string;
  primary: string;
  onPrimary: string;
  invertible?: boolean;
}

export const CLASSIC_THEME: AppTheme = {
  id: 'classic',
  label: 'Clásico',
  primary: '#4D7C68',
  onPrimary: '#FFFFFF',
};

export const THEME_PRESETS: AppTheme[] = [
  CLASSIC_THEME,
  { id: 'ocean', label: 'Océano', primary: '#1A6B8A', onPrimary: '#FFFFFF', invertible: true },
  { id: 'sunset', label: 'Atardecer', primary: '#C0392B', onPrimary: '#FFFFFF', invertible: true },
  { id: 'lavender', label: 'Lavanda', primary: '#7D5BA6', onPrimary: '#FFFFFF', invertible: true },
  { id: 'amber', label: 'Ámbar', primary: '#E67E22', onPrimary: '#FFFFFF', invertible: true },
  { id: 'slate', label: 'Pizarra', primary: '#2C3E50', onPrimary: '#FFFFFF', invertible: true },
  { id: 'rose', label: 'Rosa', primary: '#E91E8C', onPrimary: '#FFFFFF', invertible: true },
  { id: 'mint', label: 'Menta', primary: '#00897B', onPrimary: '#FFFFFF', invertible: true },
];

export function invertTheme(theme: AppTheme): AppTheme {
  return { ...theme, primary: theme.onPrimary, onPrimary: theme.primary };
}

export function edgeColor(theme: AppTheme): string {
  return hexToRgba(theme.onPrimary === '#FFFFFF' ? '#000000' : '#FFFFFF', 0.15);
}

export function buildCustomTheme(hex: string): AppTheme {
  const on = bestOnColor(hex);
  return { id: 'custom', label: 'Personalizado', primary: hex, onPrimary: on };
}

export function bestOnColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function mapAccent(theme: AppTheme, isNight: boolean): string {
  return isNight ? lightenHex(theme.primary, 40) : theme.primary;
}

function lightenHex(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function normalizeHex(hex: string): string {
  const clean = hex.startsWith('#') ? hex : `#${hex}`;
  if (clean.length === 4) {
    return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`.toUpperCase();
  }
  return clean.toUpperCase();
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hNorm = h / 360, sNorm = s / 100, lNorm = l / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}
