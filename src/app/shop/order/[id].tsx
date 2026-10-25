import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, CheckCircle2, CircleAlert, Clock3, Home, MapPin, Package, ShieldCheck, Truck, UserRound, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantStatusPill } from '@/components/merchant/merchant-ui';
import { Palette } from '@/constants/palette';
import { goBackOr } from '@/features/merchant/navigation';
import { getMerchantProducts } from '@/features/merchant/metrics';
import { orderStatusLabels } from '@/features/orders/status';
import { formatPrice } from '@/features/products/data';
import type { OrderStatus } from '@/store/orders-store';
import { useOrdersStore } from '@/store/orders-store';
import { useProfileStore } from '@/store/profile-store';
import { useShopStore } from '@/store/shop-store';

const statusActions: { status: OrderStatus; label: string; icon: typeof Check }[] = [
  { status: 'confirmed', label: 'Confirmar', icon: Check },
  { status: 'preparing', label: 'Preparar', icon: Package },
  { status: 'shipped', label: 'Enviar', icon: Truck },
  { status: 'delivered', label: 'Entregue', icon: Home },
  { status: 'cancelled', label: 'Cancelar', icon: X },
];

export default function MerchantOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const storeId = useProfileStore((state) => state.storeId);
  const products = useShopStore((state) => state.products);
  const order = useOrdersStore((state) => state.orders.find((item) => item.id === id));
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(''), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const merchantProducts = useMemo(() => getMerchantProducts(products, storeId), [products, storeId]);
  const ownedProductIds = useMemo(() => new Set(merchantProducts.map((item) => `seller-${item.id}`)), [merchantProducts]);
  const lines = useMemo(() => order?.lines.filter((line) => line.merchantId ? line.merchantId === storeId : ownedProductIds.has(line.productId)) ?? [], [order, ownedProductIds, storeId]);
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);

  if (!order || lines.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.missing}>
          <Package size={30} color={Palette.primary} />
          <Text style={styles.missingTitle}>Pedido não encontrado</Text>
          <Text style={styles.missingText}>Este pedido não contém produtos associados à sua loja.</Text>
          <Pressable accessibilityRole="button" onPress={() => goBackOr('/shop/orders')} style={styles.missingButton}>
            <Text style={styles.missingButtonText}>VOLTAR AOS PEDIDOS</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(order.createdAt).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' });

  const changeStatus = (status: OrderStatus) => {
    if (status === order.status) return;
    if (status === 'cancelled') {
      Alert.alert('Cancelar pedido', 'Esta alteração também será apresentada ao cliente. Quer continuar?', [
        { text: 'Não', style: 'cancel' },
        { text: 'Cancelar pedido', style: 'destructive', onPress: () => applyStatus(status) },
      ]);
      return;
    }
    applyStatus(status);
  };

  const applyStatus = (status: OrderStatus) => {
    updateOrderStatus(order.id, status);
    setFeedback(`Estado actualizado para “${orderStatusLabels[status]}”.`);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar aos pedidos" onPress={() => goBackOr('/shop/orders')} style={styles.backButton}>
            <ArrowLeft size={19} color={Palette.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>DETALHE DO PEDIDO</Text>
            <Text numberOfLines={1} style={styles.title}>#{order.id.slice(-8).toUpperCase()}</Text>
          </View>
          <MerchantStatusPill status={order.status} />
        </View>

        {feedback ? (
          <View style={styles.feedback}>
            <CheckCircle2 size={17} color={Palette.success} />
            <Text accessibilityRole="alert" style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}

        <View style={styles.hero}>
          <View style={styles.heroIcon}><Package size={22} color={Palette.primaryDark} /></View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroDate}>{date}</Text>
            <Text style={styles.heroMeta}>{totalItems} {totalItems === 1 ? 'unidade da sua loja' : 'unidades da sua loja'} · {formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.statusPill}><Text style={styles.statusPillText}>{orderStatusLabels[order.status]}</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Artigos da sua loja</Text>
          {lines.map((line, index) => (
            <View key={`${line.productId}-${line.size}-${line.color}-${index}`} style={styles.line}>
              <View style={styles.lineQuantity}><Text style={styles.lineQuantityText}>{line.quantity}×</Text></View>
              <View style={styles.lineCopy}>
                <Text style={styles.lineName}>{line.name}</Text>
                <Text style={styles.lineMeta}>{[line.size ? `Tamanho ${line.size}` : '', line.color].filter(Boolean).join(' · ') || 'Sem opções'}</Text>
                <Text style={styles.lineUnit}>{formatPrice(line.unitPrice)} por unidade</Text>
              </View>
              <Text style={styles.linePrice}>{formatPrice(line.unitPrice * line.quantity)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal da loja</Text>
            <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
          </View>
          {order.lines.length > lines.length ? <Text style={styles.otherLinesNote}>Este pedido também inclui artigos de outras lojas. O total abaixo corresponde apenas à sua loja.</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Actualizar estado</Text>
          <Text style={styles.sectionHint}>A alteração é apresentada ao cliente no acompanhamento do pedido.</Text>
          <View style={styles.statusActions}>
            {statusActions.map((action) => {
              const Icon = action.icon;
              const selected = order.status === action.status;
              const destructive = action.status === 'cancelled';
              return (
                <Pressable
                  key={action.status}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={selected}
                  onPress={() => changeStatus(action.status)}
                  style={[styles.statusButton, selected && styles.statusButtonSelected, destructive && styles.statusButtonDanger, selected && styles.statusButtonDisabled]}>
                  <Icon size={14} color={destructive ? Palette.error : selected ? Palette.surface : Palette.primaryDark} />
                  <Text style={[styles.statusButtonText, selected && styles.statusButtonTextSelected, destructive && styles.statusButtonTextDanger]}>{action.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {order.status === 'awaiting-confirmation' || order.status === 'payment-review' ? (
            <View style={styles.paymentNotice}>
              <Clock3 size={14} color="#805B20" />
              <Text style={styles.paymentNoticeText}>Confirme o pagamento antes de marcar o pedido como confirmado.</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Entrega</Text>
          <View style={styles.infoRow}><UserRound size={15} color={Palette.primaryDark} /><Text style={styles.infoStrong}>{order.delivery.fullName || 'Dados não disponíveis'}</Text></View>
          <View style={styles.infoRow}><MapPin size={15} color={Palette.primaryDark} /><Text style={styles.infoText}>{[order.delivery.address, order.delivery.municipality, order.delivery.province].filter(Boolean).join(', ') || 'Morada não indicada'}</Text></View>
          {order.delivery.reference ? <Text style={styles.infoDetail}>Referência: {order.delivery.reference}</Text> : null}
          <Text style={styles.infoDetail}>{[order.delivery.phone, order.delivery.email].filter(Boolean).join(' · ') || 'Contacto não indicado'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pagamento</Text>
          <View style={styles.infoRow}><Clock3 size={15} color={Palette.primaryDark} /><Text style={styles.infoText}>Transferência ou depósito</Text></View>
          <Text style={styles.infoDetail}>Referência: {order.paymentReference || 'Sem referência'}</Text>
          {order.receipt ? (
            <View style={styles.receipt}>
              <Check size={16} color={Palette.success} />
              <View style={styles.receiptCopy}>
                <Text style={styles.receiptTitle}>Comprovativo anexado pelo cliente</Text>
                <Text numberOfLines={1} style={styles.receiptName}>{order.receipt.name}</Text>
              </View>
            </View>
          ) : <Text style={styles.pendingReceipt}>Comprovativo ainda não anexado</Text>}
          <View style={styles.orderTotalRow}><Text style={styles.orderTotalLabel}>Total do pedido completo</Text><Text style={styles.orderTotalValue}>{formatPrice(order.total)}</Text></View>
        </View>

        <View style={styles.localNotice}>
          <ShieldCheck size={16} color={Palette.primaryDark} />
          <Text style={styles.noticeText}>Este pedido está guardado localmente. O estado definido aqui também é visível na área de pedidos do cliente neste dispositivo.</Text>
        </View>

        {order.status === 'cancelled' ? (
          <View style={styles.cancelledNotice}>
            <CircleAlert size={15} color={Palette.error} />
            <Text style={styles.cancelledText}>Este pedido foi cancelado. Pode voltar a confirmá-lo se necessário.</Text>
          </View>
        ) : null}

        <Pressable accessibilityRole="button" onPress={() => router.replace('/shop/orders')} style={styles.ordersButton}>
          <Text style={styles.ordersButtonText}>VER TODOS OS PEDIDOS</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 35 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Palette.surface },
  headerCopy: { flex: 1 },
  kicker: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 1.5 },
  title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 20, marginTop: 2 },
  feedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, marginBottom: 11, borderRadius: 13, backgroundColor: '#E5F3EA' },
  feedbackText: { flex: 1, color: '#286744', fontFamily: 'Poppins_500Medium', fontSize: 9, lineHeight: 15 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 15, marginBottom: 12, borderRadius: 18, backgroundColor: Palette.softPink },
  heroIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Palette.surface },
  heroCopy: { flex: 1 },
  heroDate: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  heroMeta: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 3 },
  statusPill: { maxWidth: '42%', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, backgroundColor: Palette.surface },
  statusPillText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 7, textAlign: 'center' },
  card: { padding: 15, marginBottom: 12, borderRadius: 18, backgroundColor: Palette.surface },
  sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 12, marginBottom: 11 },
  sectionHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, marginTop: -6, marginBottom: 10 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 9, borderTopWidth: 1, borderTopColor: Palette.border },
  lineQuantity: { width: 27, height: 27, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: Palette.background },
  lineQuantityText: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 8 },
  lineCopy: { flex: 1, minWidth: 0 },
  lineName: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  lineMeta: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 },
  lineUnit: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 7, marginTop: 1 },
  linePrice: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9, paddingTop: 11, borderTopWidth: 1, borderTopColor: Palette.border },
  totalLabel: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  totalValue: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 13 },
  otherLinesNote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, lineHeight: 13, marginTop: 8 },
  statusActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  statusButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 11, borderRadius: 11, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.background },
  statusButtonSelected: { backgroundColor: Palette.primaryDark, borderColor: Palette.primaryDark },
  statusButtonDanger: { backgroundColor: '#FFF1F3', borderColor: '#F4C9D0' },
  statusButtonDisabled: { opacity: 0.75 },
  statusButtonText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 8 },
  statusButtonTextSelected: { color: Palette.surface },
  statusButtonTextDanger: { color: Palette.error },
  paymentNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 9, marginTop: 10, borderRadius: 11, backgroundColor: '#FFF1D9' },
  paymentNoticeText: { flex: 1, color: '#805B20', fontFamily: 'Poppins_500Medium', fontSize: 8, lineHeight: 13 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 7 },
  infoStrong: { flex: 1, color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  infoText: { flex: 1, color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 15 },
  infoDetail: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 15, marginTop: 3 },
  receipt: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, marginTop: 10, borderRadius: 12, backgroundColor: '#EAF5EE' },
  receiptCopy: { flex: 1 },
  receiptTitle: { color: '#286744', fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  receiptName: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 },
  pendingReceipt: { color: '#805B20', fontFamily: 'Poppins_500Medium', fontSize: 9, marginTop: 8 },
  orderTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: Palette.border },
  orderTotalLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9 },
  orderTotalValue: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 10 },
  localNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 14, backgroundColor: Palette.softPink },
  noticeText: { flex: 1, color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 15 },
  cancelledNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, marginTop: 10, borderRadius: 12, backgroundColor: '#FCE7EC' },
  cancelledText: { flex: 1, color: Palette.error, fontFamily: 'Poppins_500Medium', fontSize: 8, lineHeight: 13 },
  ordersButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderRadius: 13, borderWidth: 1, borderColor: Palette.primary },
  ordersButtonText: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 0.4 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  missingTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 18, marginTop: 12 },
  missingText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, textAlign: 'center', marginTop: 6 },
  missingButton: { minHeight: 43, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 16, borderRadius: 12, backgroundColor: Palette.primary },
  missingButtonText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 0.4 },
});
