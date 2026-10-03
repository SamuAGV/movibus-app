// src/contexts/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AppTheme,
  CLASSIC_THEME,
  THEME_PRESETS,
  buildCustomTheme,
  edgeColor,
  invertTheme,
  isValidHex,
  normalizeHex,
} from '../theme/themes';

const STORAGE_KEY = '@movibus/theme-v1';

export type ResolvedTheme = AppTheme & { edge: string };

interface StoredTheme {
  id: string;
  custom?: string;
  inverted?: string[];
}

interface ThemeContextValue {
  theme: ResolvedTheme;
  selectedId: string;
  customColor: string | null;
  invertedIds: string[];
  selectPreset: (id: string) => void;
  selectCustom: (hex: string) => void;
  togglePresetInversion: (id: string) => void;
}

const withEdge = (t: AppTheme): ResolvedTheme => ({ ...t, edge: edgeColor(t) });

const resolve = (s: StoredTheme): ResolvedTheme => {
  if (s.id === 'custom' && s.custom && isValidHex(s.custom)) {
    return withEdge(buildCustomTheme(s.custom));
  }
  const base = THEME_PRESETS.find((p) => p.id === s.id) ?? CLASSIC_THEME;
  return withEdge(base.invertible && s.inverted?.includes(base.id) ? invertTheme(base) : base);
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: withEdge(CLASSIC_THEME),
  selectedId: CLASSIC_THEME.id,
  customColor: null,
  invertedIds: [],
  selectPreset: () => {},
  selectCustom: () => {},
  togglePresetInversion: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [stored, setStored] = useState<StoredTheme>({ id: CLASSIC_THEME.id });

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw || cancelled) return;
        const parsed = JSON.parse(raw) as StoredTheme;
        if (parsed && typeof parsed.id === 'string') setStored(parsed);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const persist = useCallback((next: StoredTheme) => {
    setStored(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const selectPreset = useCallback(
    (id: string) => persist({ ...stored, id }),
    [persist, stored]
  );

  const selectCustom = useCallback(
    (hex: string) => persist({ ...stored, id: 'custom', custom: normalizeHex(hex) }),
    [persist, stored]
  );

  const togglePresetInversion = useCallback(
    (id: string) => {
      const preset = THEME_PRESETS.find((p) => p.id === id);
      if (!preset?.invertible) {
        persist({ ...stored, id });
        return;
      }
      const current = stored.inverted ?? [];
      const inverted = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      persist({ ...stored, id, inverted });
    },
    [persist, stored]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolve(stored),
      selectedId: stored.id,
      customColor: stored.custom && isValidHex(stored.custom) ? stored.custom : null,
      invertedIds: stored.inverted ?? [],
      selectPreset,
      selectCustom,
      togglePresetInversion,
    }),
    [stored, selectPreset, selectCustom, togglePresetInversion]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
