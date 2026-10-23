// src/contexts/BusTypeContext.tsx
// Tipo de vehículo elegido para el marcador del mapa. Se guarda en el dispositivo
// (AsyncStorage). En la demo usamos el email como clave porque el uid cambia
// en cada login simulado; así la preferencia se conserva entre sesiones.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BusTypeId, DEFAULT_BUS_TYPE, isBusTypeId } from '../constants/busTypes';
import { useAuth } from './AuthContext';

interface BusTypeContextType {
  busType: BusTypeId;
  setBusType: (id: BusTypeId) => Promise<void>;
  loaded: boolean;
}

const BusTypeContext = createContext<BusTypeContextType>({
  busType: DEFAULT_BUS_TYPE,
  setBusType: async () => {},
  loaded: false,
});

export const BusTypeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  // En la demo el uid cambia en cada login; el email es estable.
  const key = `movibus:bus-type:${user?.email ?? 'guest'}`;
  const [busType, setType] = useState<BusTypeId>(DEFAULT_BUS_TYPE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    setType(DEFAULT_BUS_TYPE);
    AsyncStorage.getItem(key)
      .then((v) => { if (alive && isBusTypeId(v)) setType(v); })
      .catch(() => {})
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, [key]);

  const setBusType = useCallback(async (id: BusTypeId) => {
    setType(id);
    try {
      await AsyncStorage.setItem(key, id);
    } catch (e) {
      console.error('Error guardando tipo de autobús:', e);
    }
  }, [key]);

  const value = useMemo(() => ({ busType, setBusType, loaded }), [busType, setBusType, loaded]);

  return <BusTypeContext.Provider value={value}>{children}</BusTypeContext.Provider>;
};

export const useBusType = () => useContext(BusTypeContext);