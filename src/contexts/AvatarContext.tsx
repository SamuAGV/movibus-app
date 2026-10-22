// src/contexts/AvatarContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ImageSourcePropType } from 'react-native';
import { AvatarOption, getAvatar } from '../constants/avatars';
import { useAuth } from './AuthContext';

interface AvatarContextType {
  avatar: AvatarOption | null;
  avatarId: string | null;
  setAvatarId: (id: string | null) => Promise<void>;
  photoUri: string | null;
  setPhotoFromUri: (tempUri: string) => Promise<void>;
  removePhoto: () => Promise<void>;
  avatarSource: ImageSourcePropType | null;
  loaded: boolean;
}

const AvatarContext = createContext<AvatarContextType>({
  avatar: null,
  avatarId: null,
  setAvatarId: async () => {},
  photoUri: null,
  setPhotoFromUri: async () => {},
  removePhoto: async () => {},
  avatarSource: null,
  loaded: false,
});

const deleteQuietly = (name: string | null) => {
  if (!name) return;
  try {
    const f = new File(Paths.document, name);
    if (f.exists) f.delete();
  } catch (e) {
    console.warn('[AvatarContext] deleteQuietly error:', e);
  }
};

export const AvatarProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const uid = user?.uid ?? 'guest';
  const key = `movibus:avatar:${uid}`;
  const photoKey = `movibus:avatar-photo:${uid}`;

  const [avatarId, setId] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const photoNameRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const applyPhotoName = (name: string | null) => {
    console.log('[AvatarContext] applyPhotoName:', name);
    photoNameRef.current = name;
    setPhotoName(name);
  };

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    setId(null);
    applyPhotoName(null);

    console.log('[AvatarContext] Cargando para uid:', uid);

    Promise.all([AsyncStorage.getItem(key), AsyncStorage.getItem(photoKey)])
      .then(([storedId, storedPhoto]) => {
        if (!alive) return;
        console.log('[AvatarContext] AsyncStorage avatar:', storedId, 'photo:', storedPhoto);
        setId(storedId);
        if (storedPhoto) {
          try {
            const file = new File(Paths.document, storedPhoto);
            console.log('[AvatarContext] ¿Existe foto?', file.exists, file.uri);
            if (file.exists) applyPhotoName(storedPhoto);
            else AsyncStorage.removeItem(photoKey).catch(() => {});
          } catch (e) {
            console.warn('[AvatarContext] Error verificando foto:', e);
            applyPhotoName(null);
          }
        }
      })
      .catch((e) => console.warn('[AvatarContext] Error cargando:', e))
      .finally(() => { if (alive) setLoaded(true); });

    return () => { alive = false; };
  }, [key, photoKey, uid]);

  const setAvatarId = useCallback(async (id: string | null) => {
    setId(id);
    try {
      if (id) await AsyncStorage.setItem(key, id);
      else await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error guardando avatar:', e);
    }
  }, [key]);

  const setPhotoFromUri = useCallback(async (tempUri: string) => {
    console.log('[AvatarContext] setPhotoFromUri recibido:', tempUri);

    if (!tempUri || !tempUri.trim()) {
      throw new Error('URI de foto vacía');
    }

    const rawExt = (tempUri.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
    const ext = /^(jpg|jpeg|png|webp|heic)$/.test(rawExt) ? rawExt : 'jpg';
    const name = `profile-${uid}-${Date.now()}.${ext}`;

    const sourceFile = new File(tempUri);
    console.log('[AvatarContext] sourceFile existe?', sourceFile.exists);

    if (!sourceFile.exists) {
      throw new Error('El archivo temporal no existe: ' + tempUri);
    }

    const destFile = new File(Paths.document, name);
    console.log('[AvatarContext] Copiando a:', destFile.uri);

    sourceFile.copy(destFile);

    console.log('[AvatarContext] ¿Copia existe?', destFile.exists, destFile.uri);

    if (!destFile.exists) {
      throw new Error('La copia no se creó correctamente');
    }

    await AsyncStorage.setItem(photoKey, name);
    console.log('[AvatarContext] AsyncStorage guardado con nombre:', name);

    const previous = photoNameRef.current;
    applyPhotoName(name);
    deleteQuietly(previous);
  }, [uid, photoKey]);

  const removePhoto = useCallback(async () => {
    const previous = photoNameRef.current;
    applyPhotoName(null);
    try {
      await AsyncStorage.removeItem(photoKey);
    } catch (e) {
      console.error('Error quitando foto:', e);
    }
    deleteQuietly(previous);
  }, [photoKey]);

  const photoUri = useMemo(() => {
    if (!photoName) return null;
    try {
      const uri = new File(Paths.document, photoName).uri;
      console.log('[AvatarContext] photoUri calculado:', uri);
      return uri;
    } catch (e) {
      console.warn('[AvatarContext] Error calculando photoUri:', e);
      return null;
    }
  }, [photoName]);

  const avatar = getAvatar(avatarId);
  const avatarSource: ImageSourcePropType | null = photoUri
    ? { uri: photoUri }
    : avatar?.source ?? null;

  console.log('[AvatarContext] render → avatarId:', avatarId, '| photoName:', photoName, '| photoUri:', photoUri, '| avatarSource:', avatarSource ? 'SÍ' : 'NO');

  return (
    <AvatarContext.Provider
      value={{ avatar, avatarId, setAvatarId, photoUri, setPhotoFromUri, removePhoto, avatarSource, loaded }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => useContext(AvatarContext);