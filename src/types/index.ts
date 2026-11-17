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