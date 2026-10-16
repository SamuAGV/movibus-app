// src/theme/appearance.ts
// Apariencia base de la app (claro / oscuro), independiente del tema de acento.
//
// OJO: aquí solo viven fondos, superficies y textos. El color de acento
// (src/theme/themes.ts) y los colores de estado (verde/naranja/rojo, medidor
// de velocidad, ocupación) NO se tocan.

export type AppearanceMode = 'light' | 'dark';

/** 'system' = seguir el modo del teléfono (valor por defecto). */
export type AppearancePreference = 'system' | AppearanceMode;

export interface AppearanceColors {
  /** Fondo base de la pantalla. */
  background: string;
  /** Secciones y tarjetas principales. */
  surface: string;
  /** Elementos dentro de una superficie (campos, tarjetas internas, botones secundarios). */
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  /** Verde institucional legible como TEXTO sobre el fondo (el #4D7C68 se pierde en oscuro). */
  brandText: string;
  /** Fondos suaves para avisos de estado (verde = activo, naranja = atención). */
  tintGreen: string;
  tintOrange: string;
}

export const APPEARANCE_COLORS: Record<AppearanceMode, AppearanceColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    card: '#F4F5F6',
    border: '#E2E4E7',
    text: '#1A1C1E',
    textSecondary: '#5F6368',
    brandText: '#4D7C68',
    tintGreen: '#E8F5E9',
    tintOrange: '#FFF3E0',
  },
  // Oscuro "suave": gris carbón en lugar de negro puro, para que no cansen
  // ni se sienta un hueco negro. Si lo quieres más claro o más oscuro,
  // ajusta solo estos valores.
  dark: {
    background: '#262A2E',
    surface: '#30353A',
    card: '#3A4046',
    border: '#454B52',
    text: '#F5F6F7',
    textSecondary: '#B8BEC4',
    brandText: '#8FC4AB',
    tintGreen: 'rgba(76,175,80,0.18)',
    tintOrange: 'rgba(255,152,0,0.18)',
  },
};

export const APPEARANCE_STORAGE_PREFIX = 'movibus:appearance:';

export const isAppearancePreference = (v: unknown): v is AppearancePreference =>
  v === 'system' || v === 'light' || v === 'dark';