// src/components/AvatarPicker.tsx
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AVATARS } from '../constants/avatars';
import { useAvatar } from '../contexts/AvatarContext';

export default function AvatarPicker() {
  const { avatarId, setAvatarId } = useAvatar();

  return (
    <View>
      <Text style={styles.title}>Avatar</Text>
      <Text style={styles.subtitle}>Elige una imagen para tu perfil</Text>
      <View style={styles.grid}>
        {AVATARS.map((a) => {
          const selected = a.id === avatarId;
          return (
            <Pressable
              key={a.id}
              onPress={() => setAvatarId(a.id)}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              accessibilityState={{ selected }}
              style={[styles.item, selected && styles.itemSelected]}
            >
              <Image source={a.source} style={styles.image} />
            </Pressable>
          );
        })}
      </View>
      {avatarId && (
        <Pressable onPress={() => setAvatarId(null)} style={styles.removeButton}>
          <Text style={styles.removeText}>Quitar avatar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  subtitle: { fontSize: 13, color: '#999', marginTop: 2, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  item: { padding: 3, borderRadius: 40, borderWidth: 3, borderColor: 'transparent' },
  // Borde neutro: no usa colores de estado ni el acento del tema
  itemSelected: { borderColor: '#333' },
  image: { width: 72, height: 72, borderRadius: 36 },
  removeButton: { alignSelf: 'center', marginTop: 14, padding: 6 },
  removeText: { fontSize: 13, color: '#666', fontWeight: '500' },
});