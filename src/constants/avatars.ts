// src/constants/avatars.ts
import { ImageSourcePropType } from 'react-native';

export interface AvatarOption {
  id: string;
  label: string;
  source: ImageSourcePropType;
}

// Los require() de imágenes deben ser estáticos en React Native
export const AVATARS: AvatarOption[] = [
  { id: 'avatar1', label: 'Avatar 1', source: require('../../assets/avatares/avatar1.jpeg') },
  { id: 'avatar2', label: 'Avatar 2', source: require('../../assets/avatares/avatar2.jpeg') },
  { id: 'avatar3', label: 'Avatar 3', source: require('../../assets/avatares/avatar3.jpeg') },
  { id: 'avatar4', label: 'Avatar 4', source: require('../../assets/avatares/avatar4.jpeg') },
  { id: 'avatar5', label: 'Avatar 5', source: require('../../assets/avatares/avatar5.jpeg') },
  { id: 'avatar6', label: 'Avatar 6', source: require('../../assets/avatares/avatar6.jpeg') },
];

export const getAvatar = (id: string | null): AvatarOption | null =>
  AVATARS.find((a) => a.id === id) ?? null;