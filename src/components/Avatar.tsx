// src/components/Avatar.tsx — muestra foto propia > avatar > inicial
import React from 'react';
import { Image, Text, View } from 'react-native';
import { useAvatar } from '../contexts/AvatarContext';

interface AvatarProps {
  name?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const Avatar = ({
  name = '',
  size = 40,
  backgroundColor = '#E5E7EB',
  textColor = '#374151',
}: AvatarProps) => {
  const { avatarSource } = useAvatar();
  const radius = size / 2;

  if (avatarSource) {
    return (
      <Image
        source={avatarSource}
        style={{ width: size, height: size, borderRadius: radius }}
        accessibilityLabel="Foto de perfil"
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.45, fontWeight: '600', color: textColor }}>
        {name.trim().charAt(0).toUpperCase() || '?'}
      </Text>
    </View>
  );
};