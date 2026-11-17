import { router } from 'expo-router';
import { Camera, ChevronRight, CircleHelp, LogOut, MapPin, Package, Pencil, Trash2, Wallet } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { deleteLocalAccount, findLocalAccount, saveLocalAccount } from '@/features/auth/local-accounts';
import { useProfileStore } from '@/store/profile-store';
import { useOrdersStore } from '@/store/orders-store';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { useNotificationStore } from '@/store/notification-store';
import { useShopStore } from '@/store/shop-store';
import { useState } from 'react';

export default function ProfileScreen() {
  const orderCount = useOrdersStore((state) => state.orders.length);
  const name = useProfileStore((state) => state.name);
  const email = useProfileStore((state) => state.email);
  const accountType = useProfileStore((state) => state.accountType);
  const avatarUri = useProfileStore((state) => state.avatarUri);
  const storeName = useProfileStore((state) => state.storeName);
  const storeId = useProfileStore((state) => state.storeId);
  const setSignedIn = useProfileStore((state) => state.setSignedIn);
  const resetProfile = useProfileStore((state) => state.resetProfile);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const signOut = () => Alert.alert('Sair da conta', 'Tem a certeza de que pretende sair?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: async () => { const current = useProfileStore.getState(); const account = await findLocalAccount(current.email); if (account) await saveLocalAccount({ ...account, name: current.name, phone: current.phone, storeId: current.storeId, storeName: current.storeName, storeDescription: current.storeDescription, storePhone: current.storePhone, storeLocation: current.storeLocation, storeLogoUri: current.storeLogoUri, avatarUri: current.avatarUri, addresses: current.addresses }); setSignedIn(false); router.replace('/login'); } }]);
  const deleteAccount = () => setDeleteModalVisible(true);
  const confirmDeleteAccount = async () => {
    const current = useProfileStore.getState();
    await deleteLocalAccount(current.email);
    if (current.storeId) {
      const shop = useShopStore.getState();
      shop.products.filter((product) => product.merchantId === current.storeId).forEach((product) => shop.removeProduct(product.id, current.storeId));
    }
    useCartStore.getState().clearCart();
    useFavoritesStore.getState().clearFavorites();
    useOrdersStore.getState().clearOrders();
    useNotificationStore.getState().resetNotifications();
    resetProfile();
    setDeleteModalVisible(false);
    router.replace('/login');
  };
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Meu perfil</Text>
        <View style={styles.userCard}><Pressable accessibilityRole="button" accessibilityLabel="Editar perfil" onPress={() => router.push('/edit-profile')} style={styles.avatarWrap}>{avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" /> : <View style={styles.avatar}><Text style={styles.avatarText}>{name.trim().charAt(0).toUpperCase() || 'U'}</Text></View>}<View style={styles.cameraBadge}><Camera size={13} color={Palette.surface} /></View></Pressable><Text style={styles.userName}>{name}</Text><Text style={styles.userEmail}>{email}</Text><Pressable accessibilityRole="button" onPress={() => router.push('/edit-profile')} style={styles.editProfile}><Pencil size={14} color={Palette.primaryDark} /><Text style={styles.editProfileText}>Editar perfil</Text></Pressable></View>
        {accountType === 'merchant' && storeId ? <Pressable accessibilityRole="button" onPress={() => router.push('/shop')} style={styles.shopBanner}><View style={styles.shopBannerCopy}><Text style={styles.shopBannerTitle}>{storeName || 'A sua loja'}</Text><Text style={styles.shopBannerSubtitle}>Gerir produtos e acompanhar vendas</Text></View><ChevronRight size={19} color={Palette.primaryDark} /></Pressable> : null}
        <View style={styles.menuCard}>
          <MenuRow icon={<MapPin size={19} color={Palette.primaryDark} />} label="Endereços de entrega" onPress={() => router.push('/addresses')} last />
        </View>
        <View style={styles.menuCard}>
          <MenuRow icon={<Package size={19} color={Palette.primaryDark} />} label="Meus pedidos" detail={`${orderCount}`} onPress={() => router.push('/orders')} last />
        </View>
        <View style={styles.menuCard}>
          <MenuRow icon={<CircleHelp size={19} color={Palette.primaryDark} />} label="Ajuda e suporte" onPress={() => router.push('/support')} />
          <MenuRow icon={<Wallet size={19} color={Palette.primaryDark} />} label="Privacidade e termos" onPress={() => router.push('/legal')} last />
        </View>
        <View style={styles.menuCard}>
          <MenuRow icon={<LogOut size={19} color={Palette.primaryDark} />} label="Sair da conta" onPress={signOut} />
          <MenuRow icon={<Trash2 size={19} color={Palette.error} />} label="Apagar a minha conta" onPress={deleteAccount} danger last />
        </View>
      </ScrollView>
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => setDeleteModalVisible(false)} style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}><Trash2 size={22} color={Palette.error} /></View>
            <Text style={styles.modalTitle}>Apagar a minha conta?</Text>
            <Text style={styles.modalMessage}>Esta ação será permanente. A sua conta e todos os dados associados neste dispositivo serão removidos.</Text>
            <View style={styles.modalActions}>
              <Pressable accessibilityRole="button" onPress={() => setDeleteModalVisible(false)} style={styles.modalCancel}><Text style={styles.modalCancelText}>Cancelar</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={confirmDeleteAccount} style={styles.modalConfirm}><Text style={styles.modalConfirmText}>Apagar conta</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MenuRow({ icon, label, detail, onPress, last = false, danger = false }: { icon: React.ReactNode; label: string; detail?: string; onPress: () => void; last?: boolean; danger?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.menuRow, !last && styles.rowBorder]}>{icon}<Text style={[styles.menuLabel, danger && styles.dangerLabel]}>{label}</Text>{detail ? <Text style={styles.detail}>{detail}</Text> : null}<ChevronRight size={17} color={Palette.textSecondary} /></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background }, content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 35 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 30, marginTop: 0 },
  userCard: { alignItems: 'center', marginTop: 10, paddingVertical: 18, paddingHorizontal: 16, borderRadius: 18, backgroundColor: Palette.surface }, avatarWrap: { width: 88, height: 88 }, avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.softPink }, avatarImage: { width: 88, height: 88, borderRadius: 44 }, cameraBadge: { position: 'absolute', right: 0, bottom: 0, width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Palette.primary, borderWidth: 2, borderColor: Palette.surface }, avatarText: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 32 }, userName: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 18, marginTop: 13, textAlign: 'center' }, userEmail: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 3, textAlign: 'center' }, editProfile: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, backgroundColor: Palette.softPink }, editProfileText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 12 }, shopBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 16, marginTop: 11, backgroundColor: Palette.softPink }, shopBannerCopy: { flex: 1 }, shopBannerTitle: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 14 }, shopBannerSubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 3 },
  menuCard: { paddingHorizontal: 14, marginTop: 10, borderRadius: 17, backgroundColor: Palette.surface }, menuRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 11 }, rowBorder: { borderBottomWidth: 1, borderBottomColor: Palette.border }, menuLabel: { flex: 1, color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 13 }, detail: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 12 }, dangerLabel: { color: Palette.error }, modalRoot: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: 'rgba(30,20,25,0.38)' }, modalCard: { padding: 20, borderRadius: 20, backgroundColor: Palette.surface }, modalIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#FFF0F2' }, modalTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16, marginTop: 12 }, modalMessage: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 19, marginTop: 6 }, modalActions: { flexDirection: 'row', gap: 9, marginTop: 18 }, modalCancel: { flex: 1, minHeight: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Palette.background }, modalCancelText: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 11 }, modalConfirm: { flex: 1, minHeight: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Palette.error }, modalConfirmText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 11 },
});
