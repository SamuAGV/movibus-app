// app/(app)/student/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import BusMarker, { BusSpriteRenderer } from './components/BusMarker';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useStudentLocations } from '../../../src/hooks/useStudentLocations';
import { useDayNightMap } from '../../../src/hooks/useDayNightMap';
import { bestOnColor, hexToRgba, mapAccent } from '../../../src/theme/themes';

export default function StudentScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const { buses: busesMap, loading, error } = useStudentLocations();
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  const { isNight, mapStyle, userInterfaceStyle } = useDayNightMap();
  const routeColor = mapAccent(theme, isNight);

  // 🎯 Solo los buses reales de la API
  const buses = Object.values(busesMap);

  // 🎯 Auto-seleccionar el primer bus disponible
  useEffect(() => {
    if (!selectedBusId && buses.length > 0) {
      setSelectedBusId(buses[0].busId);
    }
    // Si el bus seleccionado desaparece (ya no está activo), resetear
    if (selectedBusId && !busesMap[selectedBusId]) {
      setSelectedBusId(buses.length > 0 ? buses[0].busId : null);
    }
  }, [buses, busesMap, selectedBusId]);

  // 🎯 Centrar el mapa en el primer bus cuando llegue (una sola vez)
  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (hasCenteredRef.current) return;
    if (buses.length === 0) return;
    if (!mapRef.current) return;

    const firstBus = buses[0];
    console.log('🎯 Centrando mapa en:', firstBus.latitude, firstBus.longitude);

    mapRef.current.animateToRegion(
      {
        latitude: firstBus.latitude,
        longitude: firstBus.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800
    );

    hasCenteredRef.current = true;
  }, [buses]);

  const selectedBus = selectedBusId ? busesMap[selectedBusId] : null;

  // 🎯 Botón "mi ubicación" → centra en el bus seleccionado
  const centerOnRoute = () => {
    const target = selectedBus || buses[0];
    if (!target || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: target.latitude,
        longitude: target.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800
    );
  };

  // Loading inicial
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.primary }]}>
        <ActivityIndicator size="large" color={theme.onPrimary} />
        <Text style={[styles.loadingText, { color: theme.onPrimary }]}>
          Conectando con los autobuses...
        </Text>
      </View>
    );
  }

  // Sin buses activos
  if (buses.length === 0) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.primary,
              borderWidth: 1,
              borderColor: theme.edge,
            },
          ]}
        >
          <View>
            <Text style={[styles.headerTitle, { color: theme.onPrimary }]}>MoviBus</Text>
            <View
              style={[
                styles.headerBadge,
                { backgroundColor: hexToRgba(theme.onPrimary, 0.2) },
              ]}
            >
              <View style={styles.headerDot} />
              <Text style={[styles.headerBadgeText, { color: theme.onPrimary }]}>
                0 buses activos
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push('/(app)/profile')}
          >
            <View
              style={[
                styles.profileInitialWrap,
                { backgroundColor: hexToRgba(theme.onPrimary, 0.2) },
              ]}
            >
              <Text style={[styles.profileInitial, { color: theme.onPrimary }]}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="bus-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No hay autobuses activos</Text>
          <Text style={styles.emptySubtitle}>
            {error
              ? `Error: ${error}`
              : 'Esperando a que los conductores comiencen a compartir su ubicación'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BusSpriteRenderer />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={mapStyle}
        userInterfaceStyle={userInterfaceStyle}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsTraffic={false}
      >
        {/* Marcadores de buses reales */}
        {buses.map((bus) => (
          <BusMarker
            key={bus.busId}
            id={bus.busId}
            latitude={bus.latitude}
            longitude={bus.longitude}
            heading={bus.heading || 45}
            selected={selectedBusId === bus.busId}
            title={`Autobús ${bus.busId}`}
            description={`Velocidad: ${Math.round((bus.speed || 0) * 3.6)} km/h`}
            onPress={() => setSelectedBusId(bus.busId)}
          />
        ))}
      </MapView>

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.primary,
            borderWidth: 1,
            borderColor: theme.edge,
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: theme.onPrimary }]}>MoviBus</Text>
          <View
            style={[
              styles.headerBadge,
              { backgroundColor: hexToRgba(theme.onPrimary, 0.2) },
            ]}
          >
            <View style={styles.headerDot} />
            <Text style={[styles.headerBadgeText, { color: theme.onPrimary }]}>
              {buses.length} {buses.length === 1 ? 'bus activo' : 'buses activos'}
            </Text>
          </View>
          <Text style={[styles.modeIndicator, { color: hexToRgba(theme.onPrimary, 0.7) }]}>
            {isNight ? '🌙 Modo noche' : '☀️ Modo día'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push('/(app)/profile')}
        >
          <View
            style={[
              styles.profileInitialWrap,
              { backgroundColor: hexToRgba(theme.onPrimary, 0.2) },
            ]}
          >
            <Text style={[styles.profileInitial, { color: theme.onPrimary }]}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapBtn} onPress={centerOnRoute}>
          <Ionicons name="locate" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handleBar} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {selectedBus && (
            <View style={styles.selectedCard}>
              <View style={styles.selectedHeader}>
                <View
                  style={[
                    styles.busIcon,
                    {
                      backgroundColor: theme.primary,
                      borderWidth: 1,
                      borderColor: theme.edge,
                    },
                  ]}
                >
                  <Ionicons name="bus" size={22} color={theme.onPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.busIdText}>Autobús {selectedBus.busId}</Text>
                  <Text style={styles.busDriverText}>
                    Conductor: {selectedBus.driverId || 'Desconocido'}
                  </Text>
                </View>
                <View style={styles.speedBadge}>
                  <Text style={[styles.speedBadgeValue, { color: theme.primary }]}>
                    {Math.round((selectedBus.speed || 0) * 3.6)}
                  </Text>
                  <Text style={styles.speedBadgeLabel}>km/h</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.listCard}>
            <Text style={styles.listTitle}>Autobuses activos</Text>
            {buses.map((bus) => {
              const isSelected = selectedBusId === bus.busId;
              return (
                <TouchableOpacity
                  key={bus.busId}
                  style={[styles.busItem, isSelected && styles.busItemSelected]}
                  onPress={() => setSelectedBusId(bus.busId)}
                >
                  <View
                    style={[
                      styles.busItemIcon,
                      isSelected && {
                        backgroundColor: theme.primary,
                        borderWidth: 1,
                        borderColor: theme.edge,
                      },
                    ]}
                  >
                    <Ionicons
                      name="bus"
                      size={18}
                      color={isSelected ? theme.onPrimary : theme.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.busItemId}>{bus.busId}</Text>
                    <Text style={styles.busItemDriver}>
                      {bus.driverId || 'Conductor'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, styles.statusActive]}>
                    <Text style={styles.statusBadgeText}>
                      {Math.round((bus.speed || 0) * 3.6)} km/h
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.takeBusBtn,
              {
                backgroundColor: theme.primary,
                borderWidth: 1,
                borderColor: theme.edge,
              },
            ]}
          >
            <Ionicons name="log-in" size={20} color={theme.onPrimary} />
            <Text style={[styles.takeBusText, { color: theme.onPrimary }]}>
              Voy a tomar este autobús
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f6' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  stopMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  stopMarkerText: { fontWeight: 'bold', fontSize: 12 },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 5,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
    gap: 5,
  },
  headerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' },
  headerBadgeText: { fontSize: 11, fontWeight: '600' },
  modeIndicator: { fontSize: 10, marginTop: 3, fontStyle: 'italic' },
  profileBtn: { padding: 4 },
  profileInitialWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: { fontSize: 16, fontWeight: 'bold' },
  mapControls: { position: 'absolute', right: 16, bottom: 400, gap: 10 },
  mapBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 420,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginVertical: 12,
  },
  selectedCard: {
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8ecea',
  },
  selectedHeader: { flexDirection: 'row', alignItems: 'center' },
  busIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  busIdText: { fontSize: 15, fontWeight: '600', color: '#333' },
  busDriverText: { fontSize: 12, color: '#666', marginTop: 2 },
  speedBadge: { alignItems: 'center' },
  speedBadgeValue: { fontSize: 20, fontWeight: 'bold' },
  speedBadgeLabel: { fontSize: 10, color: '#999' },
  listCard: {
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8ecea',
    marginBottom: 12,
  },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12 },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: 'white',
  },
  busItemSelected: {
    backgroundColor: '#e9f0ec',
    borderWidth: 1,
    borderColor: '#4d7c68',
  },
  busItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e9f0ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  busItemId: { fontSize: 13, fontWeight: '600', color: '#333' },
  busItemDriver: { fontSize: 11, color: '#888', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusActive: { backgroundColor: '#e8f5e9' },
  statusBadgeText: { fontSize: 11, fontWeight: '600', color: '#555' },
  takeBusBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  takeBusText: { fontSize: 15, fontWeight: '600' },
});