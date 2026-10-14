// app/(app)/_layout.tsx
import { router, Stack, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { AppearanceProvider, useAppearance } from '../../src/contexts/AppearanceContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { AvatarProvider } from '../../src/contexts/AvatarContext';
import { ThemeProvider } from '../../src/contexts/ThemeContext';

export default function AppLayout() {
  return (
    <ThemeProvider>
      <AvatarProvider>
        <AppearanceProvider>
          <AppLayoutContent />
        </AppearanceProvider>
      </AvatarProvider>
    </ThemeProvider>
  );
}

function AppLayoutContent() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const { colors, isDark } = useAppearance();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    const currentRoute = segments[1]; // 'driver' | 'student' | 'profile' | undefined
    const roleRoute = user.role === 'driver' ? 'driver' : 'student';

    // Solo redirige si el usuario está en la raíz o en la ruta del otro rol.
    // Deja pasar 'profile' siempre.
    const isProfile = currentRoute === 'profile';
    const isCorrectRole = currentRoute === roleRoute;

    if (!currentRoute) {
      router.replace(`/(app)/${roleRoute}`);
      return;
    }

    if (!isCorrectRole && !isProfile) {
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
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.brandText} />
        <Text style={{ marginTop: 16, color: colors.brandText, fontSize: 16 }}>
          Cargando...
        </Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="driver/index" options={{ headerShown: false }} />
      <Stack.Screen name="student/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Mi Perfil',
          headerStyle: {
            backgroundColor: isDark ? colors.surface : '#4d7c68',
          },
          headerTintColor: isDark ? colors.text : '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}