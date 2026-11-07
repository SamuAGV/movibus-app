// src/components/OccupancyCard.tsx
// Tarjeta de ocupación SOLO UI (demo). Datos mock locales.
// Cuando se implemente Firebase RTDB, se reemplazarán demoStatus/demoPassengers
// por un hook useOccupancy(busId) que devuelva { status, passengers }.
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppearance } from '../contexts/AppearanceContext';
import { AppearanceColors } from '../theme/appearance';

export const MAX_SEATS = 32;

export type OccupancyStatus = 'loading' | 'no-trip' | 'ok' | 'full';

export interface OccupancyCardProps {
  /** SOLO DEMO: fuerza el estado visual. */
  demoStatus?: OccupancyStatus;
  /** SOLO DEMO: pasajeros confirmados (0–32). */
  demoPassengers?: number;
}

const STATUS_COLORS = {
  green: '#34C759',
  orange: '#FF9800',
  red: '#FF3B30',
} as const;

function getBarColor(ratio: number): string {
  if (ratio >= 0.9) return STATUS_COLORS.red;
  if (ratio >= 0.6) return STATUS_COLORS.orange;
  return STATUS_COLORS.green;
}

export default function OccupancyCard({
  demoStatus = 'ok',
  demoPassengers = 14,
}: OccupancyCardProps) {
  const { colors } = useAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const passengers = Math.min(MAX_SEATS, Math.max(0, demoPassengers));
  const available = MAX_SEATS - passengers;
  const ratio = passengers / MAX_SEATS;
  const barColor = getBarColor(ratio);

  // ── Estado: cargando (skeleton) ──────────────────────────────
  if (demoStatus === 'loading') {
    return (
      <View style={styles.card} testID="occupancy-card-loading">
        <Text style={styles.cardTitle}>Ocupación del Viaje</Text>
        <View style={styles.skeletonRow}>
          <View style={[styles.skeletonBox, { width: 90 }]} />
          <View style={[styles.skeletonBox, { width: 90 }]} />
          <View style={[styles.skeletonBox, { width: 90 }]} />
        </View>
        <View style={styles.skeletonBar} />
      </View>
    );
  }

  // ── Estado: sin viaje activo ─────────────────────────────────
  if (demoStatus === 'no-trip') {
    return (
      <View style={styles.card} testID="occupancy-card-no-trip">
        <Text style={styles.cardTitle}>Ocupación del Viaje</Text>
        <View style={styles.emptyBox}>
          <Ionicons
            name="bus-outline"
            size={40}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>Sin viaje activo</Text>
        </View>
      </View>
    );
  }

  // ── Estado: ok / full ────────────────────────────────────────
  const isFull = demoStatus === 'full' || passengers >= MAX_SEATS;

  return (
    <View style={styles.card} testID="occupancy-card-ok">
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Ocupación del Viaje</Text>
        {isFull && (
          <View style={styles.fullBadge} testID="occupancy-full-badge">
            <Ionicons name="warning" size={12} color="#fff" />
            <Text style={styles.fullBadgeText}>Unidad llena</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={22} color={colors.brandText} />
          <Text style={styles.statValue} testID="occupancy-passengers">
            {passengers}
          </Text>
          <Text style={styles.statLabel}>Confirmados</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Ionicons name="seat-outline" size={22} color={colors.brandText} />
          <Text style={styles.statValue} testID="occupancy-available">
            {available}
          </Text>
          <Text style={styles.statLabel}>Disponibles</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Ionicons name="bus" size={22} color={colors.brandText} />
          <Text style={styles.statValue} testID="occupancy-capacity">
            {MAX_SEATS}
          </Text>
          <Text style={styles.statLabel}>Capacidad</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          testID="occupancy-progress"
          style={[
            styles.progressFill,
            {
              width: `${Math.round(ratio * 100)}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      <Text style={styles.progressHint}>
        {passengers} de {MAX_SEATS} asientos ocupados
      </Text>
    </View>
  );
}

const createStyles = (c: AppearanceColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.brandText,
      marginBottom: 12,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    fullBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: STATUS_COLORS.red,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    fullBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    statItem: { flex: 1, alignItems: 'center', gap: 2 },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: c.text,
      marginTop: 4,
    },
    statLabel: { fontSize: 11, color: c.textSecondary },
    divider: {
      width: 1,
      height: 40,
      backgroundColor: c.border,
      marginHorizontal: 4,
    },
    progressTrack: {
      height: 10,
      borderRadius: 5,
      backgroundColor: c.border,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 5,
    },
    progressHint: {
      fontSize: 11,
      color: c.textSecondary,
      marginTop: 6,
      textAlign: 'right',
    },

    // Skeleton
    skeletonRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    skeletonBox: {
      flex: 1,
      height: 48,
      borderRadius: 10,
      backgroundColor: c.border,
    },
    skeletonBar: {
      height: 10,
      borderRadius: 5,
      backgroundColor: c.border,
    },

    // Empty
    emptyBox: {
      alignItems: 'center',
      paddingVertical: 24,
      gap: 8,
    },
    emptyText: {
      fontSize: 13,
      color: c.textSecondary,
    },
  });