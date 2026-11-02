import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';

import { Palette } from '@/constants/palette';
import { useProfileStore } from '@/store/profile-store';
import { useNotificationStore } from '@/store/notification-store';

type MerchantHeaderProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
};

export function MerchantHeader({ title, subtitle, kicker = 'ÁREA DO COMERCIANTE' }: MerchantHeaderProps) {
  const storeName = useProfileStore((state) => state.storeName);
  const storeLogoUri = useProfileStore((state) => state.storeLogoUri);
  const storeId = useProfileStore((state) => state.storeId);
  const unreadCount = useNotificationStore((state) => state.notifications.filter((item) => !item.read && (!item.storeId || item.storeId === storeId)).length);
  const photoUri = storeLogoUri;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          <Text numberOfLines={1} style={styles.identity}>
            {storeName || 'A minha loja'} · painel de gestão
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir notificações" onPress={() => router.push('/notifications')} style={styles.notificationButton}>
          <Bell size={19} color={Palette.primaryDark} />
          {unreadCount > 0 ? <View style={styles.notificationDot} /> : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir o perfil da loja"
          onPress={() => router.push('/shop/profile')}
          style={styles.profileButton}>
          {photoUri
            ? <Image source={{ uri: photoUri }} style={styles.profileImage} contentFit="cover" />
            : <Text style={styles.profileInitial}>{storeName.trim().charAt(0).toUpperCase() || 'O'}</Text>}
        </Pressable>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1 },
  kicker: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 1.5 },
  title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 22, marginTop: 2 },
  identity: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 3 },
  subtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 17, marginTop: 9 },
  profileButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Palette.softPink },
  notificationButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Palette.surface },
  notificationDot: { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.primary, borderWidth: 1, borderColor: Palette.surface },
  profileImage: { width: 36, height: 36, borderRadius: 18 },
  profileInitial: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 16 },
});
