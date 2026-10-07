import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { SplashBrandContent } from '@/components/animated-icon';

export default function SplashScreen() {
  const { destination } = useLocalSearchParams<{ destination?: string }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(destination === 'shop' ? '/shop' : '/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [destination]);

  return <View style={styles.container}><SplashBrandContent /></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#5C3442' } });
