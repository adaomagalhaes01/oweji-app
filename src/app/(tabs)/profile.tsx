import { router } from 'expo-router';
import { Bell, Camera, ChevronRight, CircleHelp, CreditCard, Heart, LogOut, MapPin, Package, ShieldCheck, Wallet } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { useFavoritesStore } from '@/store/favorites-store';
import { useProfileStore } from '@/store/profile-store';
import { useOrdersStore } from '@/store/orders-store';
import { useState } from 'react';

export default function ProfileScreen() {
  const favoriteCount = useFavoritesStore((state) => state.productIds.length);
  const orderCount = useOrdersStore((state) => state.orders.length);
  const name = useProfileStore((state) => state.name);
  const email = useProfileStore((state) => state.email);
  const phone = useProfileStore((state) => state.phone);
  const accountType = useProfileStore((state) => state.accountType);
  const avatarUri = useProfileStore((state) => state.avatarUri);
  const storeName = useProfileStore((state) => state.storeName);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const setSignedIn = useProfileStore((state) => state.setSignedIn);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);
  const startEditing = () => { setEditName(name); setEditEmail(email); setEditPhone(phone); setEditing(true); };
  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled) updateProfile({ avatarUri: result.assets[0].uri });
    } catch { Alert.alert('Não foi possível abrir as fotografias', 'Tente novamente.'); }
  };
  const signOut = () => Alert.alert('Sair da conta', 'Tem a certeza de que pretende sair?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: () => { setSignedIn(false); router.replace('/login'); } }]);
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>A SUA CONTA OWEJI</Text><Text style={styles.title}>Meu perfil</Text>
        <View style={styles.userCard}><Pressable accessibilityRole="button" accessibilityLabel="Alterar foto de perfil" onPress={pickAvatar} style={styles.avatarWrap}>{avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" /> : <View style={styles.avatar}><Text style={styles.avatarText}>{name.trim().charAt(0).toUpperCase() || 'U'}</Text></View>}<View style={styles.cameraBadge}><Camera size={12} color={Palette.surface} /></View></Pressable><View style={styles.userInfo}><Text style={styles.userName}>{name}</Text><Text style={styles.userEmail}>{email}</Text><Pressable onPress={() => editing ? setEditing(false) : startEditing()}><Text style={styles.editLink}>{editing ? 'Cancelar edição' : 'Editar os meus dados'}</Text></Pressable></View></View>
        {editing ? <View style={styles.editCard}><ProfileField label="Nome completo" value={editName} onChangeText={setEditName} /><ProfileField label="Email" value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" /><ProfileField label="Telefone" value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" /><Pressable accessibilityRole="button" onPress={() => { updateProfile({ name: editName.trim(), email: editEmail.trim(), phone: editPhone.trim() }); setEditing(false); }} style={styles.saveButton}><Text style={styles.saveButtonText}>GUARDAR ALTERAÇÕES</Text></Pressable></View> : null}
        {accountType === 'merchant' ? <Pressable accessibilityRole="button" onPress={() => router.push('/shop')} style={styles.shopBanner}><View style={styles.shopBannerCopy}><Text style={styles.shopBannerTitle}>{storeName || 'A sua loja'}</Text><Text style={styles.shopBannerSubtitle}>Gerir produtos e acompanhar vendas</Text></View><ChevronRight size={19} color={Palette.primaryDark} /></Pressable> : null}
        <Text style={styles.sectionTitle}>A minha conta</Text>
        <View style={styles.menuCard}>
          <MenuRow icon={<MapPin size={19} color={Palette.primaryDark} />} label="Endereços de entrega" onPress={() => router.push('/addresses')} />
          <MenuRow icon={<ShieldCheck size={19} color={Palette.primaryDark} />} label="Segurança e palavra-passe" onPress={() => router.push('/security')} last />
        </View>
        <Text style={styles.sectionTitle}>Compras e preferências</Text>
        <View style={styles.menuCard}>
          <MenuRow icon={<Package size={19} color={Palette.primaryDark} />} label="Meus pedidos" detail={`${orderCount}`} onPress={() => router.push('/orders')} />
          <MenuRow icon={<Heart size={19} color={Palette.primaryDark} />} label="Os meus favoritos" detail={`${favoriteCount}`} onPress={() => router.push('/favorites')} />
          <MenuRow icon={<Bell size={19} color={Palette.primaryDark} />} label="Notificações" onPress={() => router.push('/notifications')} />
          <MenuRow icon={<CreditCard size={19} color={Palette.primaryDark} />} label="Métodos de pagamento" onPress={() => router.push('/payment-methods')} last />
        </View>
        <Text style={styles.sectionTitle}>Ajuda e segurança</Text>
        <View style={styles.menuCard}>
          <MenuRow icon={<CircleHelp size={19} color={Palette.primaryDark} />} label="Ajuda e suporte" onPress={() => router.push('/support')} />
          <MenuRow icon={<Wallet size={19} color={Palette.primaryDark} />} label="Privacidade e termos" onPress={() => router.push('/legal')} last />
        </View>
        <Pressable accessibilityRole="button" onPress={signOut} style={styles.logout}><LogOut size={18} color={Palette.primaryDark} /><Text style={styles.logoutText}>Sair da conta</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({ icon, label, detail, onPress, last = false }: { icon: React.ReactNode; label: string; detail?: string; onPress: () => void; last?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.menuRow, !last && styles.rowBorder]}>{icon}<Text style={styles.menuLabel}>{label}</Text>{detail ? <Text style={styles.detail}>{detail}</Text> : null}<ChevronRight size={17} color={Palette.textSecondary} /></Pressable>;
}

function ProfileField({ label, value, onChangeText, keyboardType = 'default' }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'email-address' | 'phone-pad' }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'} keyboardType={keyboardType} value={value} onChangeText={onChangeText} style={styles.fieldInput} /></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background }, content: { padding: 20, paddingBottom: 35 }, kicker: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 1.7 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 27, marginTop: 5 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18, padding: 16, borderRadius: 18, backgroundColor: Palette.surface }, avatarWrap: { width: 58, height: 58 }, avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.softPink }, avatarImage: { width: 58, height: 58, borderRadius: 29 }, cameraBadge: { position: 'absolute', right: -1, bottom: -1, width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Palette.primary, borderWidth: 2, borderColor: Palette.surface }, avatarText: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 21 }, userInfo: { flex: 1 }, userName: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 15 }, userEmail: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 2 }, editLink: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 11, marginTop: 5 }, editCard: { padding: 15, marginTop: 10, borderRadius: 17, backgroundColor: Palette.surface }, field: { marginBottom: 10 }, fieldLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 10, marginBottom: 5 }, fieldInput: { minHeight: 43, paddingHorizontal: 12, borderRadius: 12, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 12, backgroundColor: Palette.background, borderWidth: 1, borderColor: Palette.border }, saveButton: { minHeight: 44, marginTop: 2, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary }, saveButtonText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 0.5 }, shopBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 16, marginTop: 11, backgroundColor: Palette.softPink }, shopBannerCopy: { flex: 1 }, shopBannerTitle: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 13 }, shopBannerSubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 3 },
  sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 15, marginTop: 23, marginBottom: 10 }, menuCard: { paddingHorizontal: 14, borderRadius: 17, backgroundColor: Palette.surface }, menuRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 11 }, rowBorder: { borderBottomWidth: 1, borderBottomColor: Palette.border }, menuLabel: { flex: 1, color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 12 }, detail: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 11 }, logout: { minHeight: 53, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, marginTop: 16, borderRadius: 15, backgroundColor: Palette.softPink }, logoutText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
});
