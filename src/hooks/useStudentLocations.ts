// src/hooks/useStudentLocations.ts
import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { BusLocation } from '../types';

export const useStudentLocations = () => {
  const [buses, setBuses] = useState<Record<string, BusLocation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLocations = async () => {
    try {
      const data = await api.get<{ success: boolean; buses: BusLocation[] }>(
        '/locations'
      );

      const map: Record<string, BusLocation> = {};
      // 👇 Tipo explícito aquí
      data.buses?.forEach((bus: BusLocation) => {
        map[bus.busId] = bus;
      });

      setBuses(map);
      setError(null);
    } catch (err) {
      console.error('Error obteniendo buses:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    intervalRef.current = setInterval(fetchLocations, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { buses, loading, error };
};