// src/contexts/TripContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BusLocation } from '../types';
import {
  SpeedEvent,
  detectSpeedEvents,
  toSpeedKmh,
  classifySpeed,
  SPEED_EXCESS_KMH,
} from '../utils/speedEvents';

interface TripContextValue {
  isTripActive: boolean;
  tripLogs: BusLocation[];
  tripStartTime: number | null;
  speedEvents: SpeedEvent[];
  speedEventCount: number;
  startTrip: () => void;
  addTripLog: (log: BusLocation) => void;
  endTrip: () => {
    logs: BusLocation[];
    startTime: number | null;
    speedEvents: SpeedEvent[];
  };
  resetTrip: () => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export const TripProvider = ({ children }: { children: React.ReactNode }) => {
  const [isTripActive, setIsTripActive] = useState(false);
  const [tripLogs, setTripLogs] = useState<BusLocation[]>([]);
  const [tripStartTime, setTripStartTime] = useState<number | null>(null);

  const [speedEvents, setSpeedEvents] = useState<SpeedEvent[]>([]);
  const openEventRef = useRef<{
    startTime: number;
    endTime: number;
    maxSpeedKmh: number;
    maxLat: number;
    maxLon: number;
  } | null>(null);

  const startTrip = useCallback(() => {
    setIsTripActive(true);
    setTripLogs([]);
    setTripStartTime(Date.now());
    setSpeedEvents([]);
    openEventRef.current = null;
  }, []);

  const addTripLog = useCallback(
    (log: BusLocation) => {
      if (!isTripActive) return;

      setTripLogs((prev) => [...prev, log]);

      const kmh = toSpeedKmh(log.speed);
      if (kmh === null) return;

      const isExcess = kmh >= SPEED_EXCESS_KMH;

      if (isExcess) {
        if (!openEventRef.current) {
          openEventRef.current = {
            startTime: log.timestamp,
            endTime: log.timestamp,
            maxSpeedKmh: kmh,
            maxLat: log.latitude,
            maxLon: log.longitude,
          };
          setSpeedEvents((prev) => [
            ...prev,
            {
              startTime: log.timestamp,
              endTime: log.timestamp,
              durationMs: 0,
              maxSpeedKmh: kmh,
              level: classifySpeed(kmh),
              latitude: log.latitude,
              longitude: log.longitude,
            },
          ]);
        } else {
          openEventRef.current.endTime = log.timestamp;
          if (kmh > openEventRef.current.maxSpeedKmh) {
            openEventRef.current.maxSpeedKmh = kmh;
            openEventRef.current.maxLat = log.latitude;
            openEventRef.current.maxLon = log.longitude;
          }
          setSpeedEvents((prev) => {
            if (prev.length === 0) return prev;
            const next = [...prev];
            const last = next[next.length - 1];
            next[next.length - 1] = {
              ...last,
              endTime: log.timestamp,
              durationMs: log.timestamp - last.startTime,
              maxSpeedKmh: openEventRef.current!.maxSpeedKmh,
              level: classifySpeed(openEventRef.current!.maxSpeedKmh),
              latitude: openEventRef.current!.maxLat,
              longitude: openEventRef.current!.maxLon,
            };
            return next;
          });
        }
      } else if (openEventRef.current) {
        openEventRef.current = null;
      }
    },
    [isTripActive]
  );

  const endTrip = useCallback(() => {
    setIsTripActive(false);
    const finalEvents = detectSpeedEvents(tripLogs);
    return {
      logs: tripLogs,
      startTime: tripStartTime,
      speedEvents: finalEvents,
    };
  }, [tripLogs, tripStartTime]);

  const resetTrip = useCallback(() => {
    setIsTripActive(false);
    setTripLogs([]);
    setTripStartTime(null);
    setSpeedEvents([]);
    openEventRef.current = null;
  }, []);

  const speedEventCount = speedEvents.length;

  const value = useMemo<TripContextValue>(
    () => ({
      isTripActive,
      tripLogs,
      tripStartTime,
      speedEvents,
      speedEventCount,
      startTrip,
      addTripLog,
      endTrip,
      resetTrip,
    }),
    [
      isTripActive,
      tripLogs,
      tripStartTime,
      speedEvents,
      speedEventCount,
      startTrip,
      addTripLog,
      endTrip,
      resetTrip,
    ]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = (): TripContextValue => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip debe usarse dentro de <TripProvider>');
  return ctx;
};