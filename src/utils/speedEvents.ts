// src/utils/speedEvents.ts
import { BusLocation } from '../types';

export const SPEED_EXCESS_KMH = 80;
export const SPEED_DANGER_KMH = 100;

export type SpeedEventLevel = 'excess' | 'danger';

export interface SpeedEvent {
  startTime: number;
  endTime: number;
  durationMs: number;
  maxSpeedKmh: number;
  level: SpeedEventLevel;
  latitude: number;
  longitude: number;
}

export const toSpeedKmh = (speed: number | null | undefined): number | null => {
  if (speed == null) return null;
  if (!Number.isFinite(speed)) return null;
  if (speed < 0) return null;
  return Math.round(speed * 3.6);
};

export const classifySpeed = (kmh: number): SpeedEventLevel =>
  kmh >= SPEED_DANGER_KMH ? 'danger' : 'excess';

export const detectSpeedEvents = (logs: BusLocation[]): SpeedEvent[] => {
  const events: SpeedEvent[] = [];

  let openEvent: {
    startTime: number;
    endTime: number;
    maxSpeedKmh: number;
    maxLat: number;
    maxLon: number;
  } | null = null;

  for (const log of logs) {
    const kmh = toSpeedKmh(log.speed);
    if (kmh === null) continue;

    const isExcess = kmh >= SPEED_EXCESS_KMH;

    if (isExcess) {
      if (!openEvent) {
        openEvent = {
          startTime: log.timestamp,
          endTime: log.timestamp,
          maxSpeedKmh: kmh,
          maxLat: log.latitude,
          maxLon: log.longitude,
        };
      } else {
        openEvent.endTime = log.timestamp;
        if (kmh > openEvent.maxSpeedKmh) {
          openEvent.maxSpeedKmh = kmh;
          openEvent.maxLat = log.latitude;
          openEvent.maxLon = log.longitude;
        }
      }
    } else if (openEvent) {
      events.push({
        startTime: openEvent.startTime,
        endTime: openEvent.endTime,
        durationMs: openEvent.endTime - openEvent.startTime,
        maxSpeedKmh: openEvent.maxSpeedKmh,
        level: classifySpeed(openEvent.maxSpeedKmh),
        latitude: openEvent.maxLat,
        longitude: openEvent.maxLon,
      });
      openEvent = null;
    }
  }

  if (openEvent) {
    events.push({
      startTime: openEvent.startTime,
      endTime: openEvent.endTime,
      durationMs: openEvent.endTime - openEvent.startTime,
      maxSpeedKmh: openEvent.maxSpeedKmh,
      level: classifySpeed(openEvent.maxSpeedKmh),
      latitude: openEvent.maxLat,
      longitude: openEvent.maxLon,
    });
  }

  return events;
};

export interface SpeedEventsSummary {
  count: number;
  peakSpeedKmh: number;
  dangerCount: number;
  totalExcessMs: number;
}

export const summarizeSpeedEvents = (
  events: SpeedEvent[]
): SpeedEventsSummary => {
  if (events.length === 0) {
    return { count: 0, peakSpeedKmh: 0, dangerCount: 0, totalExcessMs: 0 };
  }
  let peak = 0;
  let dangerCount = 0;
  let totalMs = 0;
  for (const e of events) {
    if (e.maxSpeedKmh > peak) peak = e.maxSpeedKmh;
    if (e.level === 'danger') dangerCount++;
    totalMs += e.durationMs;
  }
  return {
    count: events.length,
    peakSpeedKmh: peak,
    dangerCount,
    totalExcessMs: totalMs,
  };
};