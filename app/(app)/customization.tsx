// app/(app)/customization.tsx
// Pantalla de Personalización: reúne todas las opciones para no saturar el perfil.
// Cada opción es un componente independiente que guarda su propio estado en el
// dispositivo (AsyncStorage), así que no hay botón "Guardar": al volver al
// perfil los cambios ya están aplicados.
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppearancePicker from '../../src/components/AppearancePicker';
import AvatarPicker from '../../src/components/AvatarPicker';
import ThemePicker from '../../src/components/ThemePicker';
import { useAppearance } from '../../src/contexts/AppearanceContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { AppearanceColors } from '../../src/theme/appearance';

interface CustomizationSection {
  id: string;
  /** true = solo se muestra al estudiante (el conductor solo personaliza la apariencia). */
  studentOnly?: boolean;
  Component: React.ComponentType;
}

// Orden en pantalla. Para incorporar una opción nueva (foto de perfil, tipo de autobús):
//   1) crea su componente en src/components/ (con su propio contexto + AsyncStorage)
//   2) agrégalo aquí: { id: 'bus-type', studentOnly: true, Component: BusTypePicker }
const SECTIONS: CustomizationSection[] = [
  { id: 'avatar', studentOnly: true, Component: AvatarPicker },
  { id: 'theme', studentOnly: true, Component: ThemePicker },
  { id: 'appearance', Component: AppearancePicker },
];

export default function CustomizationScreen() {
  const { user } = useAuth();
  const { colors } = useAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isStudent = user?.role !== 'driver'; // igual que el ruteo y el perfil
  const visible = SECTIONS.filter((s) => !s.studentOnly || isStudent);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.intro}>
        Los cambios se aplican al instante y se guardan en este dispositivo.
      </Text>

      {visible.map(({ id, Component }) => (
        <View key={id} style={styles.section}>
          <Component />
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (c: AppearanceColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { paddingBottom: 40 },
    intro: {
      fontSize: 13,
      color: c.textSecondary,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 4,
    },
    section: {
      backgroundColor: c.surface,
      marginTop: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: c.border,
    },
  });