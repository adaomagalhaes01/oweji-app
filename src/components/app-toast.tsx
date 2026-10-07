import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { useFeedbackStore } from '@/store/feedback-store';

export function AppToast() {
  const message = useFeedbackStore((state) => state.message);
  const dismissToast = useFeedbackStore((state) => state.dismissToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(dismissToast, 2600);
    return () => clearTimeout(timer);
  }, [dismissToast, message]);

  if (!message) return null;
  return (
    <View accessibilityLiveRegion="polite" pointerEvents="none" style={[styles.toast, { bottom: insets.bottom + 82 }]}>
      <View style={styles.icon}><Check size={16} color={Palette.surface} strokeWidth={3} /></View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', left: 18, right: 18, minHeight: 54, paddingHorizontal: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: Palette.text, zIndex: 50, elevation: 8 },
  icon: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Palette.success },
  message: { flex: 1, color: Palette.surface, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
});
