import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MerchantRestricted } from '@/components/merchant/merchant-guard';
import { Palette } from '@/constants/palette';
import { useMerchantSession } from '@/features/merchant/use-merchant-session';
import { useProfileStore } from '@/store/profile-store';

export default function ShopLayout() {
  const accountType = useProfileStore((state) => state.accountType);
  const hasHydrated = useProfileStore((state) => state.hasHydrated);
  useMerchantSession();

  if (!hasHydrated) return <View style={styles.loading} />;
  if (accountType !== 'merchant') return <MerchantRestricted />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="order/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Palette.background },
});
