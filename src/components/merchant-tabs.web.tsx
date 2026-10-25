import {
  Tabs,
  TabList,
  TabSlot,
  TabTrigger,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { ChartNoAxesColumnIncreasing, ClipboardList, Package, ReceiptText, Store } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/palette';

type TabIcon = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export default function MerchantTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <MerchantTabList>
          <TabTrigger name="shop-dashboard" href="/shop" asChild>
            <MerchantTabButton icon={ChartNoAxesColumnIncreasing} label="Início" />
          </TabTrigger>
          <TabTrigger name="shop-products" href="/shop/products" asChild>
            <MerchantTabButton icon={Package} label="Produtos" />
          </TabTrigger>
          <TabTrigger name="shop-sales" href="/shop/sales" asChild>
            <MerchantTabButton icon={ReceiptText} label="Vendas" />
          </TabTrigger>
          <TabTrigger name="shop-orders" href="/shop/orders" asChild>
            <MerchantTabButton icon={ClipboardList} label="Pedidos" />
          </TabTrigger>
          <TabTrigger name="shop-profile" href="/shop/profile" asChild>
            <MerchantTabButton icon={Store} label="Loja" />
          </TabTrigger>
        </MerchantTabList>
      </TabList>
    </Tabs>
  );
}

function MerchantTabButton({ icon: Icon, label, isFocused, ...props }: TabTriggerSlotProps & { icon: TabIcon; label: string }) {
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.tabButton, isFocused && styles.tabButtonActive, pressed && styles.pressed]}>
      <Icon size={19} color={isFocused ? Palette.primaryDark : Palette.textSecondary} strokeWidth={isFocused ? 2.4 : 1.9} />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function MerchantTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { height: '100%', paddingBottom: 82 },
  tabListContainer: { position: 'absolute', bottom: 0, width: '100%', paddingHorizontal: 14, paddingBottom: 12, paddingTop: 8, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  innerContainer: { width: '100%', maxWidth: 800, paddingVertical: 6, paddingHorizontal: 6, borderRadius: 22, flexDirection: 'row', alignItems: 'center', flexGrow: 1, gap: 4, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  tabButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 16 },
  tabButtonActive: { backgroundColor: Palette.softPink },
  tabLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 9 },
  tabLabelActive: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold' },
  pressed: { opacity: 0.7 },
});
