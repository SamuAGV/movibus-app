// src/components/ProfilePhotoPicker.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppearance } from '../contexts/AppearanceContext';
import { useAuth } from '../contexts/AuthContext';
import { useAvatar } from '../contexts/AvatarContext';
import { useTheme } from '../contexts/ThemeContext';
import { AppearanceColors } from '../theme/appearance';

export default function ProfilePhotoPicker() {
  const { user } = useAuth();
  const { photoUri, avatarSource, setPhotoFromUri, removePhoto } = useAvatar();
  const { colors } = useAppearance();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [busy, setBusy] = useState(false);

  const askToOpenSettings = (what: string) =>
    Alert.alert(
      'Permiso necesario',
      `Para continuar necesitamos acceso a ${what}. Puedes activarlo en los ajustes del teléfono.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
      ],
    );

  const handleResult = async (result: ImagePicker.ImagePickerResult) => {
    console.log('[ProfilePhotoPicker] Resultado picker:', JSON.stringify(result, null, 2));

    if (result.canceled) {
      console.log('[ProfilePhotoPicker] Usuario canceló');
      return;
    }
    if (!result.assets?.length) {
      console.log('[ProfilePhotoPicker] Sin assets');
      return;
    }

    const asset = result.assets[0];
    console.log('[ProfilePhotoPicker] Asset URI:', asset.uri);

    setBusy(true);
    try {
      await setPhotoFromUri(asset.uri);
      console.log('[ProfilePhotoPicker] Foto guardada OK');
      Alert.alert('¡Listo!', 'Tu foto de perfil se ha actualizado.');
    } catch (e: any) {
      console.error('[ProfilePhotoPicker] Error guardando foto:', e);
      Alert.alert('Error', e?.message || 'No se pudo guardar la foto. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const pickOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    console.log('[ProfilePhotoPicker] Permiso cámara:', perm);
    if (!perm.granted) return askToOpenSettings('la cámara');
    await handleResult(await ImagePicker.launchCameraAsync(pickOptions));
  };

  const chooseFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('[ProfilePhotoPicker] Permiso galería:', perm);
    const ok = perm.granted || perm.accessPrivileges === 'limited';
    if (!ok) return askToOpenSettings('tus fotos');
    await handleResult(await ImagePicker.launchImageLibraryAsync(pickOptions));
  };

  const confirmRemove = () =>
    Alert.alert('Quitar foto', '¿Quieres volver a tu avatar predefinido?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar foto', style: 'destructive', onPress: () => removePhoto() },
    ]);

  const actionStyle = [styles.button, { backgroundColor: theme.primary, borderColor: theme.edge }];

  return (
    <View>
      <Text style={styles.title}>Foto de perfil</Text>
      <Text style={styles.subtitle}>
        {avatarSource ? 'Tu foto actual' : 'Aún no tienes foto'}
      </Text>

      {/* Vista previa con la fuente actual */}
      <View style={styles.preview}>
        {busy ? (
          <View style={styles.loader}><ActivityIndicator color={theme.primary} /></View>
        ) : avatarSource ? (
          <Image source={avatarSource} style={styles.previewImage} />
        ) : (
          <View style={styles.previewEmpty}>
            <Ionicons name="person" size={40} color={colors.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.row}>
        <Pressable
          onPress={takePhoto}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Tomar foto"
          style={[actionStyle, busy && styles.disabled]}
        >
          <Ionicons name="camera-outline" size={18} color={theme.onPrimary} />
          <Text style={[styles.buttonText, { color: theme.onPrimary }]}>Tomar foto</Text>
        </Pressable>
        <Pressable
          onPress={chooseFromGallery}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Elegir de la galería"
          style={[actionStyle, busy && styles.disabled]}
        >
          <Ionicons name="images-outline" size={18} color={theme.onPrimary} />
          <Text style={[styles.buttonText, { color: theme.onPrimary }]}>Galería</Text>
        </Pressable>
      </View>

      {photoUri && (
        <Pressable onPress={confirmRemove} disabled={busy} style={styles.removeButton}>
          <Text style={styles.removeText}>Quitar foto</Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (c: AppearanceColors) =>
  StyleSheet.create({
    title: { fontSize: 18, fontWeight: '600', color: c.text },
    subtitle: { fontSize: 13, color: c.textSecondary, marginTop: 2, marginBottom: 14 },
    preview: { alignItems: 'center', marginBottom: 16 },
    previewImage: { width: 96, height: 96, borderRadius: 48 },
    previewEmpty: {
      width: 96, height: 96, borderRadius: 48,
      backgroundColor: c.card, alignItems: 'center', justifyContent: 'center',
    },
    loader: {
      width: 96, height: 96, borderRadius: 48,
      backgroundColor: c.card, alignItems: 'center', justifyContent: 'center',
    },
    row: { flexDirection: 'row', gap: 12 },
    button: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, paddingVertical: 12, borderRadius: 10, borderWidth: 1,
    },
    buttonText: { fontSize: 14, fontWeight: '600' },
    disabled: { opacity: 0.6 },
    removeButton: { alignSelf: 'center', marginTop: 14, padding: 6 },
    removeText: { fontSize: 13, color: '#FF3B30', fontWeight: '500' },
  });