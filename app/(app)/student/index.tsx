// app/(app)/student/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
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
import { MOCK_BUSES, MOCK_STOPS } from '../../../src/data/mockData';
import { useDayNightMap } from '../../../src/hooks/useDayNightMap';
import { bestOnColor, hexToRgba, mapAccent } from '../../../src/theme/themes';

export default function StudentScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const [selectedBusId, setSelectedBusId] = useState(MOCK_BUSES[0].id);

  const { isNight, mapStyle, userInterfaceStyle } = useDayNightMap();
  const routeColor = mapAccent(theme, isNight);

  const selectedBus = MOCK_BUSES.find(b => b.id === selectedBusId) || MOCK_BUSES[0];

  const centerOnRoute = () => {
    mapRef.current?.animateToRegion(
      {
        latitude: 19.4326,
        longitude: -99.1332,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      800
    );
  };

  return (
    <View style={styles.container}>
      <BusSpriteRenderer />
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 19.4326,
          longitude: -99.1332,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={mapStyle}
        userInterfaceStyle={userInterfaceStyle}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsTraffic={false}
      >
        {MOCK_BUSES.filter(b => b.isActive).map(bus => (
          <BusMarker
            key={bus.id}
            id={bus.id}
            latitude={bus.latitude}
            longitude={bus.longitude}
            heading={45}
            selected={selectedBusId === bus.id}
            title={`Autobús ${bus.id}`}
            description={`Conductor: ${bus.driverName}`}
            onPress={() => setSelectedBusId(bus.id)}
          />
        ))}

        <Polyline
          coordinates={MOCK_STOPS.map(s => ({ latitude: s.latitude, longitude: s.longitude }))}
          strokeWidth={4}
          strokeColor={routeColor}
        />

        {MOCK_STOPS.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
            description={`Parada ${index + 1}`}
          >
            <View style={[styles.stopMarker, { backgroundColor: routeColor }]}>
              <Text style={[styles.stopMarkerText, { color: bestOnColor(routeColor) }]}>
                {index + 1}
              </Text>
            </View>
          </Marker>
        ))}

        <Marker
          coordinate={{ latitude: 19.434, longitude: -99.135 }}
          title="Mi ubicación"
        >
          <View style={styles.userMarker}>
            <Ionicons name="person" size={16} color="white" />
          </View>
        </Marker>
      </MapView>

      <View style={[styles.header, { backgroundColor: theme.primary, borderWidth: 1, borderColor: theme.edge }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.onPrimary }]}>MoviBus</Text>
          <View style={[styles.headerBadge, { backgroundColor: hexToRgba(theme.onPrimary, 0.2) }]}>
            <View style={styles.headerDot} />
            <Text style={[styles.headerBadgeText, { color: theme.onPrimary }]}>
              {MOCK_BUSES.filter(b => b.isActive).length} buses activos
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push('/(app)/profile')}
        >
          <View style={[styles.profileInitialWrap, { backgroundColor: hexToRgba(theme.onPrimary, 0.2) }]}>
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

      <View style={styles.bottomSheet}>
        <View style={styles.handleBar} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <View style={[styles.busIcon, { backgroundColor: theme.primary, borderWidth: 1, borderColor: theme.edge }]}>
                <Ionicons name="bus" size={22} color={theme.onPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.busIdText}>Autobús {selectedBus.id}</Text>
                <Text style={styles.busDriverText}>
                  Conductor: {selectedBus.driverName}
                </Text>
              </View>
              <View style={styles.speedBadge}>
                <Text style={[styles.speedBadgeValue, { color: theme.primary }]}>{selectedBus.speed}</Text>
                <Text style={styles.speedBadgeLabel}>km/h</Text>
              </View>
            </View>
          </View>

          <View style={styles.listCard}>
            <Text style={styles.listTitle}>Autobuses disponibles</Text>
            {MOCK_BUSES.map(bus => {
              const isSelected = selectedBusId === bus.id;
              return (
                <TouchableOpacity
                  key={bus.id}
                  style={[styles.busItem, isSelected && styles.busItemSelected]}
                  onPress={() => setSelectedBusId(bus.id)}
                >
                  <View
                    style={[
                      styles.busItemIcon,
                      isSelected && { backgroundColor: theme.primary, borderWidth: 1, borderColor: theme.edge },
                    ]}
                  >
                    <Ionicons
                      name="bus"
                      size={18}
                      color={isSelected ? theme.onPrimary : theme.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.busItemId}>{bus.id}</Text>
                    <Text style={styles.busItemDriver}>{bus.driverName}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      bus.isActive ? styles.statusActive : styles.statusInactive,
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {bus.isActive ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={[styles.takeBusBtn, { backgroundColor: theme.primary, borderWidth: 1, borderColor: theme.edge }]}>
            <Ionicons name="log-in" size={20} color={theme.onPrimary} />
            <Text style={[styles.takeBusText, { color: theme.onPrimary }]}>Voy a tomar este autobús</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f6' },
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
  userMarker: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
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
  statusInactive: { backgroundColor: '#ffebee' },
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
