// app/(app)/_layout.tsx
import { router, Stack, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { AvatarProvider } from '../../src/contexts/AvatarContext';
import { ThemeProvider } from '../../src/contexts/ThemeContext';

export default function AppLayout() {
  return (
    <ThemeProvider>
      <AvatarProvider>
        <AppLayoutContent />
      </AvatarProvider>
    </ThemeProvider>
  );
}

function AppLayoutContent() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    const currentRoute = segments[1];
    const roleRoute = user.role === 'driver' ? 'driver' : 'student';
    if (!currentRoute || (currentRoute !== roleRoute && currentRoute !== 'profile')) {
      router.replace(`/(app)/${roleRoute}`);
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#e9f0ec',
        }}
      >
        <ActivityIndicator size="large" color="#4d7c68" />
        <Text style={{ marginTop: 16, color: '#4d7c68', fontSize: 16 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="driver/index" options={{ headerShown: false }} />
      <Stack.Screen name="student/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Mi Perfil',
          headerStyle: { backgroundColor: '#4d7c68' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack>
  );
}