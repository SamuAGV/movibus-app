// app/(app)/student/index.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView from 'react-native-maps';
import BusMarker, { BusSpriteRenderer } from './components/BusMarker';
import { useAppearance } from '../../../src/contexts/AppearanceContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useAvatar } from '../../../src/contexts/AvatarContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useDayNightMap } from '../../../src/hooks/useDayNightMap';
import { useIncidents } from '../../../src/hooks/useIncidents';
import { useStudentLocations } from '../../../src/hooks/useStudentLocations';
import ReportModal from '../../../src/components/ReportModal';
import { AppearanceColors } from '../../../src/theme/appearance';
import { hexToRgba } from '../../../src/theme/themes';
import { BusLocation } from '../../../src/types';

type BusFilter = 'all' | 'favorites' | 'seats' | 'nearby';

const FAVORITES_STORAGE_KEY = 'movibus:bus-favorites';

const distanceInKm = (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(origin.latitude)) *
      Math.cos(toRadians(destination.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const hasAvailableSeats = (bus: BusLocation) => {
  if (typeof bus.availableSeats === 'number') return bus.availableSeats > 0;
  return (
    typeof bus.passengers === 'number' &&
    typeof bus.maxPassengers === 'number' &&
    bus.maxPassengers > bus.passengers
  );
};

export default function StudentScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { colors } = useAppearance();
  const { avatarSource, photoUri } = useAvatar();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const mapRef = useRef<MapView | null>(null);
  const { buses: busesMap, loading, error } = useStudentLocations();
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BusFilter>('all');
  const [favoriteBusIds, setFavoriteBusIds] = useState<string[]>([]);
  const [favoritesLoadedFor, setFavoritesLoadedFor] = useState<string | null>(null);
  const [studentLocation, setStudentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { reports: activeIncidents } = useIncidents(selectedBusId);

  const { isNight, mapStyle, userInterfaceStyle } = useDayNightMap();

  const buses = Object.values(busesMap);
  const favoritesStorageKey = `${FAVORITES_STORAGE_KEY}:${user?.uid ?? 'anonymous'}`;

  useEffect(() => {
    let cancelled = false;
    setFavoritesLoadedFor(null);
    AsyncStorage.getItem(favoritesStorageKey)
      .then((value) => {
        if (cancelled) return;
        const parsed: unknown = value ? JSON.parse(value) : [];
        setFavoriteBusIds(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []);
        setFavoritesLoadedFor(favoritesStorageKey);
      })
      .catch(() => {
        if (!cancelled) {
          setFavoriteBusIds([]);
          setFavoritesLoadedFor(favoritesStorageKey);
        }
      });
    return () => { cancelled = true; };
  }, [favoritesStorageKey]);

  const toggleFavorite = useCallback(async (busId: string) => {
    const next = favoriteBusIds.includes(busId)
      ? favoriteBusIds.filter((id) => id !== busId)
      : [...favoriteBusIds, busId];
    setFavoriteBusIds(next);
    try {
      await AsyncStorage.setItem(favoritesStorageKey, JSON.stringify(next));
    } catch (storageError) {
      console.warn('No se pudieron guardar los favoritos:', storageError);
    }
  }, [favoriteBusIds, favoritesStorageKey]);

  const activateFilter = useCallback(async (filter: BusFilter) => {
    if (filter === 'nearby' && !studentLocation) {
      try {
        let permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (permission.status === 'granted') {
          const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setStudentLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        }
      } catch (locationError) {
        console.warn('No se pudo obtener la ubicación para filtrar autobuses:', locationError);
      }
    }
    setActiveFilter(filter);
  }, [studentLocation]);

  const filteredBuses = useMemo(() => {
    const matching = buses.filter((bus) => {
      if (activeFilter === 'favorites') return favoriteBusIds.includes(bus.busId);
      if (activeFilter === 'seats') return hasAvailableSeats(bus);
      if (activeFilter === 'nearby') {
        return studentLocation !== null && distanceInKm(studentLocation, bus) < 1;
      }
      return true;
    });
    if (selectedBusId) {
      const selected = busesMap[selectedBusId];
      if (selected && !matching.some((bus) => bus.busId === selectedBusId)) matching.push(selected);
    }
    return matching.sort((a, b) => {
      const favoriteOrder = Number(favoriteBusIds.includes(b.busId)) - Number(favoriteBusIds.includes(a.busId));
      if (favoriteOrder !== 0) return favoriteOrder;
      if (studentLocation) return distanceInKm(studentLocation, a) - distanceInKm(studentLocation, b);
      return 0;
    });
  }, [activeFilter, buses, busesMap, favoriteBusIds, selectedBusId, studentLocation]);

  const hasFilterMatches = buses.some((bus) => {
    if (activeFilter === 'favorites') return favoriteBusIds.includes(bus.busId);
    if (activeFilter === 'seats') return hasAvailableSeats(bus);
    if (activeFilter === 'nearby') return studentLocation !== null && distanceInKm(studentLocation, bus) < 1;
    return true;
  });

  const goToProfile = useCallback(() => {
    router.push('/(app)/profile');
  }, []);

  useEffect(() => {
    if (!selectedBusId && buses.length > 0) {
      setSelectedBusId(buses[0].busId);
    }
    if (selectedBusId && !busesMap[selectedBusId]) {
      setSelectedBusId(buses.length > 0 ? buses[0].busId : null);
    }
  }, [buses, busesMap, selectedBusId]);

  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (hasCenteredRef.current) return;
    if (buses.length === 0) return;
    if (!mapRef.current) return;

    const firstBus = buses[0];
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

  const HeaderAvatar = () => (
    <View
      style={[
        styles.profileInitialWrap,
        {
          backgroundColor: avatarSource ? 'transparent' : hexToRgba(theme.onPrimary, 0.2),
          borderWidth: avatarSource ? 1 : 0,
          borderColor: hexToRgba(theme.onPrimary, 0.4),
          overflow: 'hidden',
        },
      ]}
    >
      {avatarSource ? (
        <Image
          key={photoUri ?? 'static'}
          source={avatarSource}
          style={{ width: 42, height: 42 }}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.profileInitial, { color: theme.onPrimary }]}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.mapSkeleton} />
        <View style={[styles.skeletonHeader, { backgroundColor: theme.primary }]}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.onPrimary }]}>MoviBus</Text>
            <View style={[styles.skeletonLine, styles.skeletonBadge]} />
          </View>
          <View style={[styles.profileInitialWrap, styles.skeletonShape]} />
        </View>
        <View style={styles.skeletonSheet}>
          <View style={styles.handleBar} />
          <View style={styles.skeletonCard}>
            <View style={[styles.skeletonShape, styles.skeletonIcon]} />
            <View style={{ flex: 1, gap: 8 }}>
              <View style={[styles.skeletonLine, { width: '55%' }]} />
              <View style={[styles.skeletonLine, { width: '38%' }]} />
            </View>
          </View>
          <View style={styles.skeletonCard}>
            <View style={[styles.skeletonLine, { width: '45%', marginBottom: 8 }]} />
            <View style={[styles.skeletonLine, { width: '100%', height: 42 }]} />
            <View style={[styles.skeletonLine, { width: '100%', height: 42, marginTop: 8 }]} />
          </View>
        </View>
      </View>
    );
  }

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
            <Text style={[styles.headerTitle, { color: theme.onPrimary }]}>
              MoviBus
            </Text>
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
            onPress={goToProfile}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
          >
            <HeaderAvatar />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="bus-outline" size={80} color={colors.textSecondary} />
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
    <View style={styles.container} pointerEvents="box-none">
      <BusSpriteRenderer />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={mapStyle}
        userInterfaceStyle={userInterfaceStyle}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsTraffic={false}
      >
        {filteredBuses.map((bus) => (
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

      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.primary,
            borderWidth: 1,
            borderColor: theme.edge,
          },
        ]}
        pointerEvents="box-none"
      >
        <View pointerEvents="none">
          <Text style={[styles.headerTitle, { color: theme.onPrimary }]}>
            MoviBus
          </Text>
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
          <Text
            style={[
              styles.modeIndicator,
              { color: hexToRgba(theme.onPrimary, 0.7) },
            ]}
          >
            {isNight ? '🌙 Modo noche' : '☀️ Modo día'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={goToProfile}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
        >
          <HeaderAvatar />
        </TouchableOpacity>
      </View>

      <View style={styles.mapControls} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={centerOnRoute}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="locate" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

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
                  <Text style={styles.busIdText}>
                    Autobús {selectedBus.busId}
                  </Text>
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

              {activeIncidents.length > 0 && (
                <View style={styles.incidentBanner}>
                  <Ionicons name="warning" size={16} color="#e65100" />
                  <Text style={styles.incidentBannerText}>
                    {activeIncidents.length === 1
                      ? '1 incidencia activa reportada'
                      : `${activeIncidents.length} incidencias activas reportadas`}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.reportBtn, { borderColor: colors.brandText }]}
                onPress={() => setReportModalVisible(true)}
              >
                <Ionicons name="flag-outline" size={16} color={colors.brandText} />
                <Text style={[styles.reportBtnText, { color: colors.brandText }]}>
                  Reportar incidencia
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.listCard}>
            <Text style={styles.listTitle}>Autobuses activos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {([
                ['all', 'Todos'],
                ['favorites', 'Favoritos'],
                ['seats', 'Con asientos disponibles'],
                ['nearby', 'Cercanos (<1 km)'],
              ] as const).map(([filter, label]) => {
                const active = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterChip, active && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    onPress={() => activateFilter(filter)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.filterChipText, active && { color: theme.onPrimary }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {!hasFilterMatches && (
              <Text style={styles.filterEmptyText}>
                {activeFilter === 'nearby' && !studentLocation
                  ? 'Activa el permiso de ubicación para encontrar autobuses cercanos.'
                  : 'No hay buses que coincidan.'}
              </Text>
            )}
            {filteredBuses.map((bus) => {
              const isSelected = selectedBusId === bus.busId;
              const isFavorite = favoriteBusIds.includes(bus.busId);
              return (
                <View
                  key={bus.busId}
                  style={[styles.busItem, isSelected && styles.busItemSelected]}
                >
                  <TouchableOpacity style={styles.busItemMain} onPress={() => setSelectedBusId(bus.busId)} accessibilityRole="button">
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
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(bus.busId)}
                    disabled={favoritesLoadedFor !== favoritesStorageKey}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={isFavorite ? `Quitar ${bus.busId} de favoritos` : `Marcar ${bus.busId} como favorito`}
                    accessibilityState={{ selected: isFavorite }}
                  >
                    <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={21} color={isFavorite ? '#f5a623' : colors.textSecondary} />
                  </TouchableOpacity>
                </View>
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

      <ReportModal
        visible={reportModalVisible}
        busId={selectedBusId ?? ''}
        tripId={selectedBus?.driverId ?? 'trip-unknown'}
        uid={user?.uid ?? ''}
        onClose={() => setReportModalVisible(false)}
      />
    </View>
  );
}

const createStyles = (c: AppearanceColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    mapSkeleton: { ...StyleSheet.absoluteFillObject, backgroundColor: c.card },
    skeletonHeader: {
      position: 'absolute', top: 50, left: 16, right: 16,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, zIndex: 20,
    },
    skeletonSheet: {
      position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: 420,
      backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: 16, paddingBottom: 20, borderWidth: 1, borderColor: c.border,
    },
    skeletonCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 12,
    },
    skeletonLine: { height: 12, borderRadius: 6, backgroundColor: c.border },
    skeletonBadge: { width: 95, height: 10, marginTop: 8 },
    skeletonShape: { backgroundColor: c.border },
    skeletonIcon: { width: 44, height: 44, borderRadius: 22 },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      gap: 12,
      backgroundColor: c.background,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: c.text, marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: c.textSecondary, textAlign: 'center' },
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
      elevation: 20,
      zIndex: 20,
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
    profileBtn: { padding: 6, justifyContent: 'center', alignItems: 'center' },
    profileInitialWrap: {
      width: 42, height: 42, borderRadius: 21,
      justifyContent: 'center', alignItems: 'center',
    },
    profileInitial: { fontSize: 16, fontWeight: 'bold' },
    mapControls: { position: 'absolute', right: 16, bottom: 400, zIndex: 15 },
    mapBtn: {
      width: 46, height: 46, borderRadius: 23,
      backgroundColor: c.surface, justifyContent: 'center', alignItems: 'center',
      elevation: 6, borderWidth: 1, borderColor: c.border,
    },
    bottomSheet: {
      position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: 420,
      backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: 16, elevation: 12, zIndex: 10,
      borderTopWidth: 1, borderColor: c.border,
    },
    handleBar: {
      width: 40, height: 4, borderRadius: 2, backgroundColor: c.border,
      alignSelf: 'center', marginVertical: 12,
    },
    selectedCard: {
      backgroundColor: c.card, borderRadius: 14, padding: 14,
      marginBottom: 12, borderWidth: 1, borderColor: c.border,
    },
    selectedHeader: { flexDirection: 'row', alignItems: 'center' },
    busIcon: {
      width: 44, height: 44, borderRadius: 22,
      justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    busIdText: { fontSize: 15, fontWeight: '600', color: c.text },
    busDriverText: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    speedBadge: { alignItems: 'center' },
    speedBadgeValue: { fontSize: 20, fontWeight: 'bold' },
    speedBadgeLabel: { fontSize: 10, color: c.textSecondary },
    incidentBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: c.tintOrange, borderRadius: 8, padding: 8, marginTop: 10,
    },
    incidentBannerText: { fontSize: 12, fontWeight: '600', color: '#e65100', flex: 1 },
    reportBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, marginTop: 10, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
    },
    reportBtnText: { fontSize: 13, fontWeight: '700' },
    listCard: {
      backgroundColor: c.card, borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: c.border, marginBottom: 12,
    },
    listTitle: { fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 12 },
    filterRow: { gap: 8, paddingBottom: 12 },
    filterChip: {
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18,
      borderWidth: 1, borderColor: c.border, backgroundColor: c.surface,
    },
    filterChipText: { fontSize: 12, fontWeight: '600', color: c.textSecondary },
    filterEmptyText: { fontSize: 12, lineHeight: 18, color: c.textSecondary, paddingVertical: 4, marginBottom: 6 },
    busItem: {
      flexDirection: 'row', alignItems: 'center', padding: 10,
      borderRadius: 10, marginBottom: 6, backgroundColor: c.surface,
    },
    busItemMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    busItemSelected: { backgroundColor: c.tintGreen, borderWidth: 1, borderColor: c.brandText },
    busItemIcon: {
      width: 34, height: 34, borderRadius: 17, backgroundColor: c.tintGreen,
      justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    busItemId: { fontSize: 13, fontWeight: '600', color: c.text },
    busItemDriver: { fontSize: 11, color: c.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusActive: { backgroundColor: c.tintGreen },
    statusBadgeText: { fontSize: 11, fontWeight: '600', color: c.textSecondary },
    favoriteButton: { padding: 6, marginLeft: 4, justifyContent: 'center', alignItems: 'center' },
    takeBusBtn: {
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
      gap: 8, paddingVertical: 14, borderRadius: 12,
    },
    takeBusText: { fontSize: 15, fontWeight: '600' },
  });
