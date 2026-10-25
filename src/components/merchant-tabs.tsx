import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Palette } from '@/constants/palette';

export default function MerchantTabs() {
  return (
    <NativeTabs
      backgroundColor={Palette.surface}
      indicatorColor={Palette.softPink}
      tintColor={Palette.primaryDark}
      labelStyle={{ default: { color: Palette.textSecondary }, selected: { color: Palette.primaryDark } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: 'space_dashboard', selected: 'space_dashboard' }} sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="products">
        <NativeTabs.Trigger.Label>Produtos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: 'inventory_2', selected: 'inventory_2' }} sf={{ default: 'shippingbox', selected: 'shippingbox.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="sales">
        <NativeTabs.Trigger.Label>Vendas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: 'point_of_sale', selected: 'point_of_sale' }} sf={{ default: 'banknote', selected: 'banknote.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="orders">
        <NativeTabs.Trigger.Label>Pedidos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: 'receipt_long', selected: 'receipt_long' }} sf={{ default: 'list.clipboard', selected: 'list.clipboard.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Loja</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: 'storefront', selected: 'storefront' }} sf={{ default: 'storefront', selected: 'storefront.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
