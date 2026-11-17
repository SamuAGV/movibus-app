// src/types/index.ts

export interface BusLocation {
    busId: string;
    driverId: string;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    timestamp: number;
    route?: string;
  }

export type IncidentType = 'delay' | 'mechanical' | 'blocked' | 'other';

export interface IncidentReport {
  id: string;
  busId: string;
  tripId: string;
  uid: string;
  type: IncidentType;
  comment?: string;
  timestamp: number;
  expiresAt: number;
}