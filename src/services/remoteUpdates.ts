import * as Updates from 'expo-updates';

/** Descarga y aplica inmediatamente una actualización remota compatible. */
export async function checkAndApplyRemoteUpdate(): Promise<void> {
  if (__DEV__ || !Updates.isEnabled) return;

  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return;

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  } catch (error) {
    // La app sigue usando la versión instalada si el servidor no está disponible.
    console.warn('No se pudo aplicar la actualización remota:', error);
  }
}
