// src/contexts/AvatarContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AvatarOption, getAvatar } from '../constants/avatars';
import { useAuth } from './AuthContext';

interface AvatarContextType {
  avatar: AvatarOption | null;
  avatarId: string | null;
  setAvatarId: (id: string | null) => Promise<void>;
  loaded: boolean;
}

const AvatarContext = createContext<AvatarContextType>({
  avatar: null,
  avatarId: null,
  setAvatarId: async () => {},
  loaded: false,
});

export const AvatarProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  // Clave por usuario: dos cuentas en el mismo teléfono no comparten avatar
  const key = `movibus:avatar:${user?.uid ?? 'guest'}`;
  const [avatarId, setId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    setId(null);
    AsyncStorage.getItem(key)
      .then((v) => {
        if (alive) setId(v);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [key]);

  const setAvatarId = useCallback(
    async (id: string | null) => {
      setId(id);
      try {
        if (id) await AsyncStorage.setItem(key, id);
        else await AsyncStorage.removeItem(key);
      } catch (e) {
        console.error('Error guardando avatar:', e);
      }
    },
    [key]
  );

  return (
    <AvatarContext.Provider value={{ avatar: getAvatar(avatarId), avatarId, setAvatarId, loaded }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => useContext(AvatarContext);