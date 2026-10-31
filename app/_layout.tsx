// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { checkAndApplyRemoteUpdate } from '../src/services/remoteUpdates';

export default function RootLayout() {
  useEffect(() => {
    void checkAndApplyRemoteUpdate();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
