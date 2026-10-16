// src/hooks/useLocation.ts
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { BusLocation } from '../types';

export const useDriverLocation = (driverId: string, busId: string) => {
  const [location, setLocation] = useState<BusLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSharingRef = useRef(false);

  const sendLocation = async () => {
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const busLocation: BusLocation = {
        busId,
        driverId,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        heading: pos.coords.heading || 0,
        speed: pos.coords.speed || 0,
        timestamp: Date.now(),
        route: 'Fija',
      };

      setLocation(busLocation);
      await api.post('/location', busLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de ubicación');
    }
  };

  const startSharing = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        return;
      }

      setIsSharing(true);
      isSharingRef.current = true;

      await sendLocation();

      intervalRef.current = setInterval(() => {
        if (isSharingRef.current) sendLocation();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const stopSharing = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isSharingRef.current = false;
    setIsSharing(false);
    setLocation(null);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    location,
    error,
    isSharing,
    isBackgroundActive: false,
    startSharing,
    stopSharing,
  };
};