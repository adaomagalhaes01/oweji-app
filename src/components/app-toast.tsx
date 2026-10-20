import { router, usePathname } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { useCartStore } from '@/store/cart-store';

export function AppToast() {
  const itemCount = useCartStore((state) => state.items.reduce((count, item) => count + item.quantity, 0));
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { width, height } = useWindowDimensions();
  const buttonSize = 54;
  const [position, setPosition] = useState(() => ({ left: Math.max(8, width - buttonSize - 18), top: Math.max(insets.top + 8, height - insets.bottom - 150) }));
  const positionRef = useRef(position);
  const dragStart = useRef(position);
  // PanResponder stores the callbacks; the refs are accessed only when gesture events fire.
  // eslint-disable-next-line react-hooks/refs
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
    onPanResponderGrant: () => { dragStart.current = positionRef.current; },
    onPanResponderMove: (_, gesture) => {
      const screen = { width, height, topInset: insets.top, bottomInset: insets.bottom };
      const next = {
        left: Math.min(Math.max(8, dragStart.current.left + gesture.dx), Math.max(8, screen.width - buttonSize - 8)),
        top: Math.min(Math.max(screen.topInset + 8, dragStart.current.top + gesture.dy), Math.max(screen.topInset + 8, screen.height - screen.bottomInset - buttonSize - 8)),
      };
      positionRef.current = next;
      setPosition(next);
    },
  }), [height, insets.bottom, insets.top, width]);

  if (itemCount === 0 || pathname.replace(/\/$/, '').endsWith('/cart')) return null;
  return <View {...panResponder.panHandlers} style={[styles.floating, { left: position.left, top: position.top }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir carrinho com ${itemCount} ${itemCount === 1 ? 'produto' : 'produtos'}`} accessibilityLiveRegion="polite" onPress={() => router.push('/cart')} style={styles.button}>
      <ShoppingBag size={22} color={Palette.surface} />
      <View style={styles.badge}><Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text></View>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  floating: { position: 'absolute', width: 54, height: 54, zIndex: 50, elevation: 10 },
  button: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: Palette.primary, borderWidth: 2, borderColor: Palette.surface, shadowColor: '#351B27', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.24, shadowRadius: 8 },
  badge: { position: 'absolute', top: -3, right: -4, minWidth: 21, height: 21, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderRadius: 11, backgroundColor: Palette.success, borderWidth: 2, borderColor: Palette.surface }, badgeText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 9 },
});
