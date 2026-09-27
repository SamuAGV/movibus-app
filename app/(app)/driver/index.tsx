// app/(app)/driver/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { MOCK_TRIP_STATS } from '../../../src/data/mockData';

export default function DriverScreen() {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [backgroundActive, setBackgroundActive] = useState(false);

  const toggleSharing = (value: boolean) => {
    setIsSharing(value);
    setBackgroundActive(value);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Panel del Conductor</Text>
            <Text style={styles.subtitle}>Bienvenido, {user?.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push('/(app)/profile')}
          >
            <Text style={styles.profileInitial}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, isSharing ? styles.dotActive : styles.dotInactive]} />
            <Text style={styles.statusText}>
              {isSharing ? 'Compartiendo ubicación' : 'No compartiendo'}
            </Text>
          </View>
          <Switch
            value={isSharing}
            onValueChange={toggleSharing}
            trackColor={{ false: '#ccc', true: '#a5c8b8' }}
            thumbColor={isSharing ? '#4d7c68' : '#f4f3f4'}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información del Viaje</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bus asignado:</Text>
            <Text style={styles.infoValue}>BUS-001</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ruta:</Text>
            <Text style={styles.infoValue}>Ruta Centro - Norte</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Conductor:</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ubicación Actual</Text>
          <View style={styles.coordsRow}>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>Latitud</Text>
              <Text style={styles.coordValue}>19.432600</Text>
            </View>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>Longitud</Text>
              <Text style={styles.coordValue}>-99.133200</Text>
            </View>
          </View>
          <View style={styles.speedBox}>
            <Ionicons name="speedometer" size={20} color="#4caf50" />
            <Text style={styles.speedText}>45 km/h</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estadísticas de Viaje</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_TRIP_STATS.distance}</Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_TRIP_STATS.duration}</Text>
              <Text style={styles.statLabel}>Duración</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {MOCK_TRIP_STATS.passengers}/{MOCK_TRIP_STATS.maxPassengers}
              </Text>
              <Text style={styles.statLabel}>Pasajeros</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.backgroundRow}>
            <Ionicons
              name={backgroundActive ? 'cloud-done' : 'cloud-offline'}
              size={24}
              color={backgroundActive ? '#34C759' : '#999'}
            />
            <Text style={styles.backgroundText}>
              {backgroundActive
                ? 'Servicio en segundo plano activo'
                : 'Servicio en segundo plano inactivo'}
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e9f0ec' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4d7c68',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  profileBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  dotActive: { backgroundColor: '#34C759' },
  dotInactive: { backgroundColor: '#FF3B30' },
  statusText: { fontSize: 15, fontWeight: '600', color: '#333' },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4d7c68',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  coordsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  coordBox: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  coordLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
  coordValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  speedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  speedText: { fontSize: 18, fontWeight: 'bold', color: '#4caf50' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 4 },
  divider: { width: 1, height: 30, backgroundColor: '#e0e0e0' },
  backgroundRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backgroundText: { fontSize: 13, color: '#666', fontWeight: '500' },
});