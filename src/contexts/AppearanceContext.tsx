// src/contexts/AppearanceContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
    APPEARANCE_COLORS,
    APPEARANCE_STORAGE_PREFIX,
    AppearanceColors,
    AppearanceMode,
    AppearancePreference,
    isAppearancePreference,
} from '../theme/appearance';
import { useAuth } from './AuthContext';

interface AppearanceContextValue {
  /** Lo que eligió el usuario: 'system' (por defecto), 'light' o 'dark'. */
  preference: AppearancePreference;
  setPreference: (p: AppearancePreference) => void;
  /** Modo ya resuelto, el que realmente se pinta. */
  mode: AppearanceMode;
  isDark: boolean;
  colors: AppearanceColors;
  /** Modo actual del teléfono (para mostrarlo en el selector). */
  systemMode: AppearanceMode;
}

const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const scheme = useColorScheme(); // se actualiza solo cuando cambia el modo del teléfono
  const systemMode: AppearanceMode = scheme === 'dark' ? 'dark' : 'light';

  const uid = user?.uid;
  // Aplica a estudiante y conductor. Sin sesión (login/registro) se queda en claro.
  const enabled = !!user;

  const [preference, setPreferenceState] = useState<AppearancePreference>('system');

  // Cargar la preferencia guardada (una por usuario, igual que el avatar)
  useEffect(() => {
    let cancelled = false;
    setPreferenceState('system');
    if (!uid) return;
    AsyncStorage.getItem(APPEARANCE_STORAGE_PREFIX + uid)
      .then((value) => {
        if (!cancelled && isAppearancePreference(value)) setPreferenceState(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const setPreference = useCallback(
    (p: AppearancePreference) => {
      setPreferenceState(p);
      if (uid) {
        AsyncStorage.setItem(APPEARANCE_STORAGE_PREFIX + uid, p).catch(() => {});
      }
    },
    [uid]
  );

  const mode: AppearanceMode = !enabled
    ? 'light'
    : preference === 'system'
      ? systemMode
      : preference;

  const value = useMemo<AppearanceContextValue>(
    () => ({
      preference,
      setPreference,
      mode,
      isDark: mode === 'dark',
      colors: APPEARANCE_COLORS[mode],
      systemMode,
    }),
    [preference, setPreference, mode, systemMode]
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance debe usarse dentro de <AppearanceProvider>');
  return ctx;
}