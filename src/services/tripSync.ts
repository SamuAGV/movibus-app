// src/services/tripSync.ts
// Cola local para guardar resúmenes de viaje que fallaron al enviarse al backend.
// Cuando la API vuelve a estar disponible, se reintentan sin perder datos.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripSummary } from '../utils/tripMath';

const QUEUE_KEY = '@movibus/pending-trip-summaries';

interface PendingSummary extends TripSummary {
  queuedAt: number;
}

/** Guarda un resumen pendiente de sincronizar. */
export const enqueuePendingSummary = async (
  summary: TripSummary
): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: PendingSummary[] = raw ? JSON.parse(raw) : [];
    queue.push({ ...summary, queuedAt: Date.now() });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('[tripSync] Error encolando resumen:', e);
  }
};

/** Reintenta enviar todos los resúmenes pendientes. */
export const flushPendingSummaries = async (
  saveFn: (s: TripSummary) => Promise<void>
): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return;
    const queue: PendingSummary[] = JSON.parse(raw);
    const stillPending: PendingSummary[] = [];

    for (const summary of queue) {
      try {
        const { queuedAt, ...clean } = summary;
        await saveFn(clean as TripSummary);
      } catch {
        stillPending.push(summary);
      }
    }

    if (stillPending.length > 0) {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(stillPending));
    } else {
      await AsyncStorage.removeItem(QUEUE_KEY);
    }
  } catch (e) {
    console.warn('[tripSync] Error en flush:', e);
  }
};

/** Cuenta cuántos resúmenes están pendientes (para mostrar un badge). */
export const countPendingSummaries = async (): Promise<number> => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return 0;
    const queue: PendingSummary[] = JSON.parse(raw);
    return queue.length;
  } catch {
    return 0;
  }
};