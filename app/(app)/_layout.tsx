// app/(app)/profile.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppearance } from '../../src/contexts/AppearanceContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useAvatar } from '../../src/contexts/AvatarContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { AppearanceColors } from '../../src/theme/appearance';
import { edgeColor } from '../../src/theme/themes';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { colors } = useAppearance();
  const { avatarSource, photoUri } = useAvatar();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isStudent = user?.role !== 'driver';
  const roleText = user?.role === 'driver' ? 'Conductor' : 'Estudiante';
  const roleColor = user?.role === 'driver' ? colors.brandText : '#007AFF';
  const accentEdge = isStudent ? edgeColor(theme) : 'transparent';

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View
          style={[
            styles.avatarWrap,
            {
              borderWidth: isStudent ? 1 : 0,
              borderColor: accentEdge,
            },
          ]}
        >
          {avatarSource ? (
            <Image
              key={photoUri ?? 'static'}
              source={avatarSource}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          )}
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
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemLast]}
          onPress={() => router.push('/(app)/customization')}
          accessibilityRole="button"
          accessibilityLabel="Abrir personalización"
        >
          <View style={styles.menuItemLeft}>
            <Ionicons
              name="color-palette-outline"
              size={22}
              color={colors.text}
              style={styles.menuIcon}
            />
            <View>
              <Text style={styles.menuItemText}>Personalización</Text>
              <Text style={styles.menuItemHint}>
                {isStudent
                  ? 'Foto, avatar, color de la interfaz y apariencia'
                  : 'Apariencia'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seguridad</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color={colors.text}
              style={styles.menuIcon}
            />
            <Text style={styles.menuItemText}>Cambiar contraseña</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
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

const createStyles = (c: AppearanceColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      alignItems: 'center',
      paddingVertical: 30,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    avatarWrap: {
      width: 100,
      height: 100,
      borderRadius: 50,
      overflow: 'hidden',
      marginBottom: 12,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: { width: 100, height: 100 },
    avatarText: { fontSize: 44, fontWeight: 'bold', color: 'white' },
    userName: { fontSize: 22, fontWeight: 'bold', color: c.text },
    roleBadge: {
      marginTop: 8,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },
    roleText: { fontSize: 13, fontWeight: '600' },
    section: {
      marginTop: 20,
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: c.border,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    card: { backgroundColor: c.card, borderRadius: 14, padding: 16 },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    label: { fontSize: 14, color: c.textSecondary },
    value: { fontSize: 14, fontWeight: '600', color: c.text },
    divider: { height: 1, backgroundColor: c.border },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    menuItemLast: { borderBottomWidth: 0 },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    menuIcon: { marginRight: 12 },
    menuItemText: { fontSize: 16, color: c.text, fontWeight: '500' },
    menuItemHint: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
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
    version: {
      textAlign: 'center',
      color: c.textSecondary,
      fontSize: 12,
      marginTop: 24,
    },
  });