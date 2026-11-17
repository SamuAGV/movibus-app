// src/services/incidentService.ts
import { IncidentReport, IncidentType } from '../types';

const EXPIRY_MS = 30 * 60 * 1000; // 30 minutos
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos por tipo

// Almacén en memoria (simula Firebase Realtime Database)
const store: Record<string, IncidentReport[]> = {};

// Rastrea el último envío por usuario+tipo
const lastSent: Record<string, number> = {};

function activeReports(busId: string): IncidentReport[] {
  const now = Date.now();
  return (store[busId] ?? []).filter((r) => r.expiresAt > now);
}

export function getIncidents(busId: string): IncidentReport[] {
  return activeReports(busId);
}

export function submitIncident(
  busId: string,
  tripId: string,
  uid: string,
  type: IncidentType,
  comment?: string
): { ok: boolean; error?: string } {
  const cooldownKey = `${uid}:${type}`;
  const last = lastSent[cooldownKey] ?? 0;
  const now = Date.now();

  if (now - last < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - last)) / 1000 / 60);
    return {
      ok: false,
      error: `Ya enviaste este tipo de reporte. Espera ${remaining} min.`,
    };
  }

  const report: IncidentReport = {
    id: `${uid}-${now}`,
    busId,
    tripId,
    uid,
    type,
    comment: comment?.trim() || undefined,
    timestamp: now,
    expiresAt: now + EXPIRY_MS,
  };

  store[busId] = [...(store[busId] ?? []), report];
  lastSent[cooldownKey] = now;

  return { ok: true };
}

export function expireReportsForTrip(busId: string): void {
  store[busId] = [];
}
