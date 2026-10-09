// src/components/Avatar.tsx — muestra el avatar elegido o la inicial como respaldo
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
  const { avatar } = useAvatar();
  const radius = size / 2;

  if (avatar) {
    return (
      <Image
        source={avatar.source}
        style={{ width: size, height: size, borderRadius: radius }}
        accessibilityLabel="Avatar de perfil"
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