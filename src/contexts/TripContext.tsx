// src/contexts/TripContext.tsx
// Guarda los puntos de ubicación del viaje en curso mientras el conductor comparte.
// Al finalizar el viaje, la pantalla de resumen los consume para calcular las métricas.
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
  } from 'react';
  import { BusLocation } from '../types';
  
  interface TripContextValue {
    /** Si hay un viaje activo en curso. */
    isTripActive: boolean;
    /** Logs de ubicación del viaje en curso. */
    tripLogs: BusLocation[];
    /** Momento en que se inició el viaje. */
    tripStartTime: number | null;
    /** Inicia un nuevo viaje y limpia los logs previos. */
    startTrip: () => void;
    /** Añade un punto al viaje en curso. */
    addTripLog: (log: BusLocation) => void;
    /** Termina el viaje y devuelve los logs acumulados. */
    endTrip: () => { logs: BusLocation[]; startTime: number | null };
    /** Limpia el estado del viaje (útil tras ver el resumen). */
    resetTrip: () => void;
  }
  
  const TripContext = createContext<TripContextValue | undefined>(undefined);
  
  export const TripProvider = ({ children }: { children: React.ReactNode }) => {
    const [isTripActive, setIsTripActive] = useState(false);
    const [tripLogs, setTripLogs] = useState<BusLocation[]>([]);
    const [tripStartTime, setTripStartTime] = useState<number | null>(null);
  
    const startTrip = useCallback(() => {
      setIsTripActive(true);
      setTripLogs([]);
      setTripStartTime(Date.now());
    }, []);
  
    const addTripLog = useCallback(
      (log: BusLocation) => {
        if (!isTripActive) return;
        setTripLogs((prev) => [...prev, log]);
      },
      [isTripActive]
    );
  
    const endTrip = useCallback(() => {
      setIsTripActive(false);
      return { logs: tripLogs, startTime: tripStartTime };
    }, [tripLogs, tripStartTime]);
  
    const resetTrip = useCallback(() => {
      setIsTripActive(false);
      setTripLogs([]);
      setTripStartTime(null);
    }, []);
  
    const value = useMemo<TripContextValue>(
      () => ({
        isTripActive,
        tripLogs,
        tripStartTime,
        startTrip,
        addTripLog,
        endTrip,
        resetTrip,
      }),
      [isTripActive, tripLogs, tripStartTime, startTrip, addTripLog, endTrip, resetTrip]
    );
  
    return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
  };
  
  export const useTrip = (): TripContextValue => {
    const ctx = useContext(TripContext);
    if (!ctx) throw new Error('useTrip debe usarse dentro de <TripProvider>');
    return ctx;
  };