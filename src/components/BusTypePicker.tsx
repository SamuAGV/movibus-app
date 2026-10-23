// src/components/BusTypePicker.tsx
// Selector del tipo de vehículo del marcador del mapa (autobús, taxi, van).
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BUS_TYPES } from '../constants/busTypes';
import { useAppearance } from '../contexts/AppearanceContext';
import { useBusType } from '../contexts/BusTypeContext';
import { useTheme } from '../contexts/ThemeContext';
import { AppearanceColors } from '../theme/appearance';
import { VehicleDrawing } from './VehicleDrawings';

export default function BusTypePicker() {
  const { colors } = useAppearance();
  const { theme } = useTheme();
  const { busType, setBusType } = useBusType();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View>
      <Text style={styles.title}>Tipo de autobús</Text>
      <Text style={styles.subtitle}>Elige cómo quieres ver los autobuses en el mapa</Text>

      <View style={styles.grid}>
        {BUS_TYPES.map((t) => {
          const active = t.id === busType;
          return (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.8}
              onPress={() => setBusType(t.id)}
              accessibilityRole="button"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: active }}
              style={[styles.card, active && styles.cardActive]}
            >
              <View style={styles.preview}>
                <VehicleDrawing
                  type={t.id}
                  uid={`preview-${t.id}`}
                  facingLeft={false}
                  selected={false}
                  width={92}
                />
              </View>
              <Text style={styles.cardLabel} numberOfLines={2}>{t.label}</Text>
              {active && (
                <View style={[styles.check, { backgroundColor: theme.primary, borderColor: theme.edge }]}>
                  <Ionicons name="checkmark" size={14} color={theme.onPrimary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (c: AppearanceColors) =>
  StyleSheet.create({
    title: { fontSize: 18, fontWeight: '600', color: c.text },
    subtitle: { fontSize: 12, color: c.textSecondary, marginTop: 4, marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: {
      width: '30.5%',
      alignItems: 'center',
      padding: 8,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: c.card,
    },
    cardActive: { borderColor: c.text },
    preview: { height: 58, alignItems: 'center', justifyContent: 'center' },
    cardLabel: { fontSize: 11, color: c.text, marginTop: 6, fontWeight: '500', textAlign: 'center' },
    check: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });