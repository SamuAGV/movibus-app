// src/utils/tripMath.ts
// Utilidades para calcular el resumen del viaje.
// Todo se hace en el cliente porque es una demo (en producción esto iría en el backend).
import { BusLocation } from '../types';

/** Distancia entre dos coordenadas usando la fórmula de Haversine (en metros). */
export const haversine = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Radio de la Tierra en metros
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/** Velocidad máxima razonable para un autobús: 200 km/h ≈ 55.5 m/s. */
const MAX_SPEED_MS = (200 * 1000) / 3600;

export interface TripSummary {
  startTime: number;
  endTime: number;
  durationMs: number;
  durationText: string;
  distanceMeters: number;
  distanceText: string;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  passengers: number;
  isTooShort: boolean;
  pointsCount: number;
}

/**
 * Calcula el resumen a partir de los logs de ubicación del viaje.
 * Descarta saltos de GPS imposibles (velocidad > 200 km/h entre dos puntos).
 */
export const calculateTripSummary = (
  logs: BusLocation[],
  passengers: number
): TripSummary => {
  if (logs.length < 2) {
    const now = Date.now();
    return {
      startTime: logs[0]?.timestamp ?? now,
      endTime: now,
      durationMs: 0,
      durationText: '00:00',
      distanceMeters: 0,
      distanceText: '0 m',
      avgSpeedKmh: 0,
      maxSpeedKmh: 0,
      passengers,
      isTooShort: true,
      pointsCount: logs.length,
    };
  }

  // Ordenar por timestamp por seguridad
  const sorted = [...logs].sort((a, b) => a.timestamp - b.timestamp);

  const startTime = sorted[0].timestamp;
  const endTime = sorted[sorted.length - 1].timestamp;
  const durationMs = endTime - startTime;

  let distance = 0;
  let validPoints = 0;
  let maxSpeedMs = 0;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    const d = haversine(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );

    const dt = (curr.timestamp - prev.timestamp) / 1000; // segundos
    if (dt <= 0) continue;

    const speed = d / dt; // m/s

    // Descartar saltos de GPS imposibles
    if (speed > MAX_SPEED_MS) continue;

    distance += d;
    validPoints++;

    // El GPS del conductor también reporta la velocidad
    if (curr.speed && curr.speed > maxSpeedMs) {
      maxSpeedMs = curr.speed;
    }
  }

  const durationSeconds = durationMs / 1000;
  const avgSpeedKmh =
    durationSeconds > 0 ? (distance / durationSeconds) * 3.6 : 0;
  const maxSpeedKmh = maxSpeedMs * 3.6;

  return {
    startTime,
    endTime,
    durationMs,
    durationText: formatDuration(durationMs),
    distanceMeters: distance,
    distanceText: formatDistance(distance),
    avgSpeedKmh: Math.round(avgSpeedKmh),
    maxSpeedKmh: Math.round(maxSpeedKmh),
    passengers,
    isTooShort: validPoints < 2,
    pointsCount: validPoints,
  };
};

export const formatDuration = (ms: number): string => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `${minutes} min`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};