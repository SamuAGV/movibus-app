// src/constants/busTypes.ts
// Tipos de vehículo disponibles para el marcador del mapa.
// Los dibujos viven en src/components/VehicleDrawings.tsx (SVG vectorial, sin imágenes).

export type BusTypeId = 'bus' | 'taxi' | 'van';

export interface BusTypeOption {
  id: BusTypeId;
  label: string;
}

export const DEFAULT_BUS_TYPE: BusTypeId = 'bus';

export const BUS_TYPES: BusTypeOption[] = [
  { id: 'bus', label: 'Autobús' },
  { id: 'taxi', label: 'Taxi' },
  { id: 'van', label: 'Van de pasajeros' },
];

export const isBusTypeId = (v: unknown): v is BusTypeId =>
  typeof v === 'string' && BUS_TYPES.some((t) => t.id === v);