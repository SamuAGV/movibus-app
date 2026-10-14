// src/components/AppearancePicker.tsx
// Selector de apariencia: Automático / Claro / Oscuro.
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppearance } from '../contexts/AppearanceContext';
import { AppearanceColors, AppearancePreference } from '../theme/appearance';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const OPTIONS: { id: AppearancePreference; label: string; icon: IconName }[] = [
  { id: 'system', label: 'Automático', icon: 'phone-portrait-outline' },
  { id: 'light', label: 'Claro', icon: 'sunny-outline' },
  { id: 'dark', label: 'Oscuro', icon: 'moon-outline' },
];

export default function AppearancePicker() {
  const { preference, setPreference, colors, systemMode } = useAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View>
      <Text style={styles.title}>Apariencia</Text>
      <Text style={styles.hint}>
        {preference === 'system'
          ? `Sigue el modo de tu teléfono (ahora: ${systemMode === 'dark' ? 'oscuro' : 'claro'}).`
          : 'Fijo en el modo que elegiste, sin importar el del teléfono.'}
      </Text>

      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const selected = preference === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => setPreference(opt.id)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`Apariencia ${opt.label}`}
            >
              <Ionicons
                name={opt.icon}
                size={24}
                color={selected ? colors.text : colors.textSecondary}
                style={styles.icon}
              />
              <Text style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
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
    hint: { fontSize: 12, color: c.textSecondary, marginTop: 4, marginBottom: 14 },
    row: { flexDirection: 'row', gap: 10 },
    option: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: c.card,
      // Borde neutro: no usa el acento ni colores de estado
      borderWidth: 2,
      borderColor: 'transparent',
    },
    optionSelected: { borderColor: c.text },
    icon: { marginBottom: 6 },
    label: { fontSize: 13, color: c.textSecondary, fontWeight: '500' },
    labelSelected: { color: c.text, fontWeight: '700' },
  });