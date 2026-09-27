// app/(app)/index.tsx
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AppIndex() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const route = user.role === 'driver' ? 'driver' : 'student';
    router.replace(`/(app)/${route}`);
  }, [user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e9f0ec' }}>
      <ActivityIndicator size="large" color="#4d7c68" />
    </View>
  );
}