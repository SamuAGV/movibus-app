// app/index.tsx
import { router, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

export default function AppIndex() {
  const { user, loading } = useAuth();
  const rootNavState = useRootNavigationState();

  useEffect(() => {
    console.log('index.tsx state:', { key: rootNavState?.key, loading, user });
    if (!rootNavState?.key || loading) return;

    if (!user) {
      console.log('Redirigiendo a login...');
      router.replace('/(auth)/login');
      return;
    }

    const roleRoute = user.role === 'driver' ? 'driver' : 'student';
    console.log('Redirigiendo a:', roleRoute);
    router.replace(`/(app)/${roleRoute}`);
  }, [user, loading, rootNavState?.key]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e9f0ec' }}>
      <ActivityIndicator size="large" color="#4d7c68" />
    </View>
  );
}