// app/(app)/student/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { useStudentLocations } from '../../../src/hooks/useStudentLocations';
import { AppearanceColors } from '../../../src/theme/appearance';
import { hexToRgba } from '../../../src/theme/themes';

export default function StudentScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { colors } = useAppearance();
  const { avatarSource, photoUri } = useAvatar();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const mapRef = useRef<MapView | null>(null);
  const { buses: busesMap, loading, error } = useStudentLocations();
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  const { isNight, mapStyle, userInterfaceStyle } = useDayNightMap();

  const buses = Object.values(busesMap);

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

  // Sub-componente: círculo del header con la foto propia o la inicial
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.primary }]}>
        <ActivityIndicator size="large" color={theme.onPrimary} />
        <Text style={[styles.loadingText, { color: theme.onPrimary }]}>
          Conectando con los autobuses...
        </Text>
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
                  <Text
                    style={[styles.speedBadgeValue, { color: theme.primary }]}
                  >
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

const createStyles = (c: AppearanceColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    loadingText: { fontSize: 16, fontWeight: '600' },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      gap: 12,
      backgroundColor: c.background,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: c.text,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
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
    headerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#34C759',
    },
    headerBadgeText: { fontSize: 11, fontWeight: '600' },
    modeIndicator: { fontSize: 10, marginTop: 3, fontStyle: 'italic' },
    profileBtn: {
      padding: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileInitialWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileInitial: { fontSize: 16, fontWeight: 'bold' },
    mapControls: {
      position: 'absolute',
      right: 16,
      bottom: 400,
      zIndex: 15,
    },
    mapBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: c.surface,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      borderWidth: 1,
      borderColor: c.border,
    },
    bottomSheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      maxHeight: 420,
      backgroundColor: c.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 16,
      elevation: 12,
      zIndex: 10,
      borderTopWidth: 1,
      borderColor: c.border,
    },
    handleBar: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginVertical: 12,
    },
    selectedCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
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
    busIdText: { fontSize: 15, fontWeight: '600', color: c.text },
    busDriverText: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    speedBadge: { alignItems: 'center' },
    speedBadgeValue: { fontSize: 20, fontWeight: 'bold' },
    speedBadgeLabel: { fontSize: 10, color: c.textSecondary },
    listCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 12,
    },
    listTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
      marginBottom: 12,
    },
    busItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 10,
      marginBottom: 6,
      backgroundColor: c.surface,
    },
    busItemSelected: {
      backgroundColor: c.tintGreen,
      borderWidth: 1,
      borderColor: c.brandText,
    },
    busItemIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: c.tintGreen,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    busItemId: { fontSize: 13, fontWeight: '600', color: c.text },
    busItemDriver: { fontSize: 11, color: c.textSecondary, marginTop: 2 },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    statusActive: { backgroundColor: c.tintGreen },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
    },
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