// app/(app)/profile.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const roleText = user?.role === 'driver' ? 'Conductor' : 'Estudiante';
  const roleColor = user?.role === 'driver' ? '#4d7c68' : '#007AFF';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: roleColor }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{roleText}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{user?.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.value}>{roleText}</Text>
          </View>
        </View>
      </View>

      {user?.role === 'driver' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Conductor</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>No. Licencia</Text>
              <Text style={styles.value}>LIC-12345</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Bus asignado</Text>
              <Text style={styles.value}>BUS-001</Text>
            </View>
          </View>
        </View>
      )}

      {user?.role === 'student' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Estudiante</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Matrícula</Text>
              <Text style={styles.value}>STU-20240001</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Carrera</Text>
              <Text style={styles.value}>Ing. en Sistemas</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Cuatrimestre</Text>
              <Text style={styles.value}>5°</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seguridad</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="lock-closed-outline" size={20} color="#4d7c68" />
          <Text style={styles.menuText}>Cambiar contraseña</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>MoviBus Demo v1.0.0</Text>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: 'white' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 44, fontWeight: 'bold', color: 'white' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: { fontSize: 13, fontWeight: '600' },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { backgroundColor: 'white', borderRadius: 14, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 14, color: '#888' },
  value: { fontSize: 14, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  menuText: { flex: 1, fontSize: 15, color: '#333' },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF3B30',
    marginTop: 30,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutText: { color: 'white', fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 24 },
});