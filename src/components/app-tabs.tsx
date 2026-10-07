import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Palette } from '@/constants/palette';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Palette.surface}
      indicatorColor={Palette.softPink}
      tintColor={Palette.primaryDark}
      labelStyle={{ default: { color: Palette.textSecondary }, selected: { color: Palette.primaryDark } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: 'home', selected: 'home' }} sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Categorias</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: 'search', selected: 'search' }} sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>Carrinho</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: 'shopping_cart', selected: 'shopping_cart' }} sf={{ default: 'bag', selected: 'bag.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Label>Favoritos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: 'favorite_border', selected: 'favorite' }} sf={{ default: 'heart', selected: 'heart.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: 'person_outline', selected: 'person' }} sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
