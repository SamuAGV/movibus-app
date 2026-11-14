// app/(app)/_layout.tsx
import { router, Stack, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { AppearanceProvider, useAppearance } from '../../src/contexts/AppearanceContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { AvatarProvider } from '../../src/contexts/AvatarContext';
import { BusTypeProvider } from '../../src/contexts/BusTypeContext';
import { ThemeProvider, useTheme } from '../../src/contexts/ThemeContext';
import { TripProvider } from '../../src/contexts/TripContext';

export default function AppLayout() {
  return (
    <ThemeProvider>
      <AvatarProvider>
        <BusTypeProvider>
          <TripProvider>
            <AppearanceProvider>
              <AppLayoutContent />
            </AppearanceProvider>
          </TripProvider>
        </BusTypeProvider>
      </AvatarProvider>
    </ThemeProvider>
  );
}

function AppLayoutContent() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { colors, isDark } = useAppearance();
  // Cast a string[] para evitar el error de tupla en Expo Router 6
  const segments = useSegments() as string[];

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    const currentRoute = segments[1];
    const roleRoute = user.role === 'driver' ? 'driver' : 'student';

    const sharedRoutes = ['profile', 'customization', 'trip-summary'];
    const isShared = currentRoute && sharedRoutes.includes(currentRoute);
    const isCorrectRole = currentRoute === roleRoute;

    if (!currentRoute) {
      router.replace(`/(app)/${roleRoute}`);
      return;
    }

    if (!isCorrectRole && !isShared) {
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
            backgroundColor: isDark ? colors.surface : theme.primary,
          },
          headerTintColor: isDark ? colors.text : theme.onPrimary,
          headerTitleStyle: { fontWeight: 'bold' },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="customization"
        options={{
          title: 'Personalización',
          headerBackTitle: 'Perfil',
          headerStyle: {
            backgroundColor: isDark ? colors.surface : theme.primary,
          },
          headerTintColor: isDark ? colors.text : theme.onPrimary,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen
        name="trip-summary"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}