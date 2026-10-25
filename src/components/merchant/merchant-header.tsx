import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/palette';
import { useProfileStore } from '@/store/profile-store';

type MerchantHeaderProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
};

export function MerchantHeader({ title, subtitle, kicker = 'ÁREA DO COMERCIANTE' }: MerchantHeaderProps) {
  const name = useProfileStore((state) => state.name);
  const email = useProfileStore((state) => state.email);
  const storeName = useProfileStore((state) => state.storeName);
  const avatarUri = useProfileStore((state) => state.avatarUri);
  const storeLogoUri = useProfileStore((state) => state.storeLogoUri);
  const photoUri = storeLogoUri ?? avatarUri;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          <Text numberOfLines={1} style={styles.identity}>
            {storeName || 'A minha loja'} · {name.split(' ')[0] || 'comerciante'} · {email}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir o perfil da loja"
          onPress={() => router.push('/shop/profile')}
          style={styles.profileButton}>
          {photoUri
            ? <Image source={{ uri: photoUri }} style={styles.profileImage} contentFit="cover" />
            : <Text style={styles.profileInitial}>{storeName.trim().charAt(0).toUpperCase() || name.trim().charAt(0).toUpperCase() || 'O'}</Text>}
        </Pressable>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1 },
  kicker: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 1.5 },
  title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 22, marginTop: 2 },
  identity: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 3 },
  subtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, lineHeight: 17, marginTop: 9 },
  profileButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Palette.softPink },
  profileImage: { width: 36, height: 36, borderRadius: 18 },
  profileInitial: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 16 },
});
