// src/data/mockData.ts
export interface MockBus {
    id: string;
    driverName: string;
    latitude: number;
    longitude: number;
    speed: number;
    isActive: boolean;
  }
  
  export interface MockRouteStop {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }
  
  export const MOCK_BUSES: MockBus[] = [
    {
      id: 'BUS-001',
      driverName: 'Juan Pérez',
      latitude: 19.4326,
      longitude: -99.1332,
      speed: 45,
      isActive: true,
    },
    {
      id: 'BUS-002',
      driverName: 'María López',
      latitude: 19.436,
      longitude: -99.14,
      speed: 30,
      isActive: true,
    },
    {
      id: 'BUS-003',
      driverName: 'Carlos Ruiz',
      latitude: 19.428,
      longitude: -99.128,
      speed: 0,
      isActive: false,
    },
  ];
  
  export const MOCK_STOPS: MockRouteStop[] = [
    { id: '1', name: 'Parada Central', latitude: 19.4326, longitude: -99.1332 },
    { id: '2', name: 'Parada Norte', latitude: 19.436, longitude: -99.14 },
    { id: '3', name: 'Parada Sur', latitude: 19.428, longitude: -99.128 },
    { id: '4', name: 'Parada Este', latitude: 19.43, longitude: -99.125 },
  ];
  
  export const MOCK_TRIP_STATS = {
    distance: 12.5,
    duration: '35 min',
    passengers: 28,
    maxPassengers: 32,
  };