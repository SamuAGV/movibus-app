// app/(app)/student/components/BusMarker.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

interface BusMarkerProps {
  id: string;
  latitude: number;
  longitude: number;
  heading?: number;
  selected?: boolean;
  title?: string;
  description?: string;
  onPress?: () => void;
}

export default function BusMarker({
  id,
  latitude,
  longitude,
  selected = false,
  title,
  description,
  onPress,
}: BusMarkerProps) {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      title={title}
      description={description}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={[styles.marker, selected && styles.markerSelected]}>
        <Text style={styles.markerText}>🚌</Text>
        <Text style={styles.markerLabel}>{id}</Text>
      </View>
    </Marker>
  );
}

// Componente vacío requerido por el import en student/index.tsx
export function BusSpriteRenderer() {
  return null;
}

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 4,
    borderWidth: 2,
    borderColor: '#4D7C68',
    elevation: 4,
  },
  markerSelected: {
    borderColor: '#E67E22',
    backgroundColor: '#FFF8F0',
  },
  markerText: { fontSize: 20 },
  markerLabel: { fontSize: 9, fontWeight: '700', color: '#333', marginTop: 1 },
});
