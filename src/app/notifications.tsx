import { router } from 'expo-router';
import { ArrowLeft, Bell, CheckCheck, Heart, Tag } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { useNotificationStore } from '@/store/notification-store';
import type { AppNotification } from '@/store/notification-store';

export default function NotificationsScreen() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}><ArrowLeft size={20} color={Palette.text} /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.kicker}>FIQUE POR DENTRO</Text><Text style={styles.title}>Notificações</Text></View>
        {unreadCount > 0 ? <Pressable accessibilityRole="button" onPress={markAllRead} style={styles.readAll}><CheckCheck size={18} color={Palette.primaryDark} /></Pressable> : <View style={styles.readAll} />}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <NotificationRow item={item} onPress={() => markRead(item.id)} />}
        ListEmptyComponent={<View style={styles.empty}><Bell size={28} color={Palette.primary} /><Text style={styles.emptyTitle}>Sem notificações</Text><Text style={styles.emptySubtitle}>Quando houver novidades, elas vão aparecer aqui.</Text></View>}
      />
    </SafeAreaView>
  );
}

function NotificationRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.card, !item.read && styles.unreadCard]}>
      <View style={styles.icon}>{item.id === 'collection' ? <Tag size={18} color={Palette.primaryDark} /> : <Heart size={18} color={Palette.primaryDark} />}</View>
      <View style={styles.copy}><View style={styles.titleLine}><Text style={styles.notificationTitle}>{item.title}</Text>{!item.read ? <View style={styles.unreadDot} /> : null}</View><Text style={styles.message}>{item.message}</Text><Text style={styles.time}>{item.time}</Text></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background }, header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, gap: 12 }, back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.surface }, headerCopy: { flex: 1 }, kicker: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 1.5 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 22, marginTop: 1 }, readAll: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 18, paddingBottom: 24, gap: 10 }, card: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 17, backgroundColor: Palette.surface }, unreadCard: { borderWidth: 1, borderColor: Palette.softPink, backgroundColor: '#FFFBFC' }, icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.softPink }, copy: { flex: 1 }, titleLine: { flexDirection: 'row', alignItems: 'center', gap: 7 }, notificationTitle: { flex: 1, color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12 }, unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Palette.primary }, message: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, lineHeight: 17, marginTop: 4 }, time: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 9, marginTop: 7 },
  empty: { alignItems: 'center', padding: 28, marginTop: 30, borderRadius: 18, backgroundColor: Palette.surface }, emptyTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 15, marginTop: 10 }, emptySubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, textAlign: 'center', marginTop: 5 },
});
