import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/palette';
import { orderStatusLabels } from '@/features/orders/status';
import type { OrderStatus } from '@/store/orders-store';

export function MerchantMetric({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <View style={styles.metric}>
      {icon}
      <Text numberOfLines={1} style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  );
}

export function MerchantStatusPill({ status }: { status: OrderStatus }) {
  const done = status === 'delivered';
  const cancelled = status === 'cancelled';
  const pending = status === 'awaiting-confirmation' || status === 'payment-review';
  const active = !done && !cancelled && !pending;
  return (
    <View style={[styles.status, active && styles.statusActive, done && styles.statusDone, cancelled && styles.statusCancelled]}>
      <Text style={[styles.statusText, active && styles.statusTextActive, done && styles.statusTextDone, cancelled && styles.statusTextCancelled]}>
        {orderStatusLabels[status]}
      </Text>
    </View>
  );
}

export function MerchantEmptyState({ icon, title, text, actionLabel, onAction }: { icon: ReactNode; title: string; text: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.emptyAction}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  metric: { flex: 1, minHeight: 104, padding: 11, borderRadius: 15, backgroundColor: Palette.surface },
  metricValue: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 12, marginTop: 8 },
  metricLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 2 },
  metricHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 7, marginTop: 3 },
  status: { maxWidth: '54%', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 9, backgroundColor: '#FFF1D9' },
  statusActive: { backgroundColor: Palette.softPink },
  statusDone: { backgroundColor: '#E5F3EA' },
  statusCancelled: { backgroundColor: '#FCE7EC' },
  statusText: { color: '#805B20', fontFamily: 'Poppins_600SemiBold', fontSize: 7, textAlign: 'center' },
  statusTextActive: { color: Palette.primaryDark },
  statusTextDone: { color: '#286744' },
  statusTextCancelled: { color: Palette.error },
  empty: { alignItems: 'center', padding: 22, borderRadius: 17, backgroundColor: Palette.surface },
  emptyIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Palette.softPink },
  emptyTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 13, marginTop: 10 },
  emptyText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, textAlign: 'center', lineHeight: 16, marginTop: 5 },
  emptyAction: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 14, borderRadius: 12, backgroundColor: Palette.primary },
  emptyActionText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 0.4 },
});
