// app/(app)/trip-summary.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppearance } from '../../src/contexts/AppearanceContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTrip } from '../../src/contexts/TripContext';
import {
  enqueuePendingSummary,
  flushPendingSummaries,
} from '../../src/services/tripSync';
import { AppearanceColors } from '../../src/theme/appearance';
import {
  TripSummary,
  calculateTripSummary,
  formatTime,
} from '../../src/utils/tripMath';

type ScreenState = 'loading' | 'ready' | 'too-short';

export default function TripSummaryScreen() {
  const { colors } = useAppearance();
  const { theme } = useTheme();
  const { endTrip, resetTrip } = useTrip();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [state, setState] = useState<ScreenState>('loading');
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [saveWarning, setSaveWarning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setState('loading');

      // 1. Obtener los logs del viaje que acaba de terminar
      const { logs } = endTrip();

      // 2. Delay para mostrar el skeleton (simula el cálculo en el backend)
      await new Promise((r) => setTimeout(r, 900));
      if (cancelled) return;

      // 3. Calcular resumen en local (esto es siempre el fallback)
      const localSummary = calculateTripSummary(logs, 14 /* demo: pasajeros */);

      // 4. Intentar guardar en el backend simulado
      let savedOk = false;
      try {
        // Aquí iría: await api.post('/trip/summary', localSummary)
        // En la demo simulamos un 20% de fallo para probar el fallback
        const simulateFailure = Math.random() < 0.2;
        if (simulateFailure) {
          throw new Error('API no disponible (simulado)');
        }
        savedOk = true;
      } catch {
        savedOk = false;
      }

      // 5. Si falló, encolar para reintentar
      if (!savedOk) {
        await enqueuePendingSummary(localSummary);
        // Intentamos flush por si la API ya volvió
        await flushPendingSummaries(async () => {
          // Simulación: si pasa la próxima, se limpia la cola
          if (Math.random() < 0.5) return Promise.resolve();
          return Promise.reject(new Error('sigue caída'));
        });
      }

      if (cancelled) return;
      setSaveWarning(!savedOk);
      setSummary(localSummary);

      // 6. ¿Viaje demasiado corto?
      setState(localSummary.isTooShort ? 'too-short' : 'ready');
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    resetTrip();
    router.replace('/(app)/driver');
  };

  // ── Estado: cargando ────────────────────────────────────────
  if (state === 'loading' || !summary) {
    return (
      <View style={styles.container}>
        <View style={styles.headerClose}>
          <View style={styles.skeletonCloseBtn} />
        </View>
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonCard} />
          <View style={[styles.skeletonBigCard]}>
            <ActivityIndicator color={theme.primary} />
            <Text style={styles.skeletonText}>Calculando resumen del viaje…</Text>
          </View>
          <View style={styles.skeletonGrid}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonStatCard} />
            ))}
          </View>
        </View>
      </View>
    );
  }

  // ── Estado: demasiado corto ─────────────────────────────────
  if (state === 'too-short') {
    return (
      <View style={styles.container}>
        <View style={styles.headerClose}>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Ionicons name="close" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyBox}>
          <Ionicons
            name="hourglass-outline"
            size={72}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>Viaje demasiado corto</Text>
          <Text style={styles.emptySubtitle}>
            No se registraron suficientes puntos para calcular el resumen
            ({summary.pointsCount} punto{summary.pointsCount === 1 ? '' : 's'}).
          </Text>

          <TouchableOpacity
            style={[
              styles.doneBtn,
              {
                backgroundColor: theme.primary,
                borderColor: theme.edge,
                marginTop: 24,
                minWidth: 200,
              },
            ]}
            onPress={handleClose}
          >
            <Text style={[styles.doneText, { color: theme.onPrimary }]}>
              Volver al panel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Estado: listo ───────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.headerClose}>
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {saveWarning && (
          <View style={styles.warningBox}>
            <Ionicons
              name="cloud-offline-outline"
              size={18}
              color="#8D6E00"
            />
            <Text style={styles.warningText}>
              No se pudo guardar en el servidor. El resumen se calculó
              localmente y se reintentará automáticamente.
            </Text>
          </View>
        )}

        {/* Inicio y fin */}
        <View style={styles.timeCard}>
          <View style={styles.timeColumn}>
            <Text style={styles.timeLabel}>Inicio</Text>
            <Text style={styles.timeValue}>
              {formatTime(summary.startTime)}
            </Text>
          </View>
          <View style={styles.timeArrow}>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
          <View style={styles.timeColumn}>
            <Text style={styles.timeLabel}>Fin</Text>
            <Text style={styles.timeValue}>
              {formatTime(summary.endTime)}
            </Text>
          </View>
        </View>

        {/* Duración destacada */}
        <View style={styles.bigCard}>
          <Ionicons name="time-outline" size={28} color={theme.primary} />
          <Text style={styles.bigValue}>{summary.durationText}</Text>
          <Text style={styles.bigLabel}>Duración total</Text>
        </View>

        {/* Grid de estadísticas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="navigate-outline" size={22} color={theme.primary} />
            <Text style={styles.statValue}>{summary.distanceText}</Text>
            <Text style={styles.statLabel}>Distancia</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons
              name="speedometer-outline"
              size={22}
              color={theme.primary}
            />
            <Text style={styles.statValue}>{summary.avgSpeedKmh} km/h</Text>
            <Text style={styles.statLabel}>Vel. promedio</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flash-outline" size={22} color={theme.primary} />
            <Text style={styles.statValue}>{summary.maxSpeedKmh} km/h</Text>
            <Text style={styles.statLabel}>Vel. máxima</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={22} color={theme.primary} />
            <Text style={styles.statValue}>{summary.passengers}</Text>
            <Text style={styles.statLabel}>Pasajeros</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.doneBtn,
            { backgroundColor: theme.primary, borderColor: theme.edge },
          ]}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar resumen"
        >
          <Text style={[styles.doneText, { color: theme.onPrimary }]}>
            Listo
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (c: AppearanceColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },

    headerClose: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },

    content: { padding: 16, gap: 12 },

    warningBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 10,
      backgroundColor: '#FFF8E1',
      borderWidth: 1,
      borderColor: '#FFE082',
    },
    warningText: { flex: 1, fontSize: 12, color: '#8D6E00' },

    timeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    timeColumn: { flex: 1, alignItems: 'center' },
    timeLabel: { fontSize: 12, color: c.textSecondary },
    timeValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: c.text,
      marginTop: 4,
    },
    timeArrow: { paddingHorizontal: 12 },

    bigCard: {
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 24,
      borderWidth: 1,
      borderColor: c.border,
      gap: 6,
    },
    bigValue: { fontSize: 32, fontWeight: 'bold', color: c.text },
    bigLabel: { fontSize: 13, color: c.textSecondary },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: {
      flexBasis: '48%',
      backgroundColor: c.surface,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      gap: 6,
    },
    statValue: { fontSize: 20, fontWeight: 'bold', color: c.text },
    statLabel: { fontSize: 12, color: c.textSecondary },

    doneBtn: {
      marginTop: 12,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
    },
    doneText: { fontSize: 16, fontWeight: '700' },

    // Estado "viaje corto"
    emptyBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 12,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: c.text },
    emptySubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
    },

    // Skeleton
    skeletonContent: { padding: 16, gap: 12 },
    skeletonCloseBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: c.border,
    },
    skeletonCard: {
      height: 80,
      borderRadius: 14,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    skeletonBigCard: {
      height: 140,
      borderRadius: 14,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    skeletonText: { color: c.textSecondary, fontSize: 13 },
    skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    skeletonStatCard: {
      flexBasis: '48%',
      height: 90,
      borderRadius: 14,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
  });