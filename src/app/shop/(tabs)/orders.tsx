import { router } from 'expo-router';
import { ChevronRight, ClipboardList, Clock3, MapPin, Package, UserRound } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantHeader } from '@/components/merchant/merchant-header';
import { MerchantEmptyState, MerchantStatusPill } from '@/components/merchant/merchant-ui';
import { Palette } from '@/constants/palette';
import { getMerchantProducts, getMerchantSales, type MerchantSaleGroup } from '@/features/merchant/metrics';
import { formatPrice } from '@/features/products/data';
import { useOrdersStore } from '@/store/orders-store';
import { useProfileStore } from '@/store/profile-store';
import { useShopStore } from '@/store/shop-store';

type OrderFilter = 'all' | 'pending' | 'active' | 'done';

const filters: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Por confirmar' },
  { value: 'active', label: 'Em curso' },
  { value: 'done', label: 'Concluídos' },
];

function matchesFilter(sale: MerchantSaleGroup, filter: OrderFilter) {
  if (filter === 'all') return true;
  const status = sale.order.status;
  if (filter === 'pending') return status === 'awaiting-confirmation' || status === 'payment-review';
  if (filter === 'active') return status === 'confirmed' || status === 'preparing' || status === 'shipped';
  return status === 'delivered' || status === 'cancelled';
}

export default function MerchantOrdersScreen() {
  const storeId = useProfileStore((state) => state.storeId);
  const products = useShopStore((state) => state.products);
  const orders = useOrdersStore((state) => state.orders);
  const [filter, setFilter] = useState<OrderFilter>('all');

  const merchantProducts = useMemo(() => getMerchantProducts(products, storeId), [products, storeId]);
  const ownedProductIds = useMemo(() => merchantProducts.map((product) => `seller-${product.id}`), [merchantProducts]);
  const sales = useMemo(() => getMerchantSales(orders, storeId, ownedProductIds), [orders, storeId, ownedProductIds]);
  const visibleSales = sales.filter((sale) => matchesFilter(sale, filter));
  const pendingCount = sales.filter((sale) => matchesFilter(sale, 'pending')).length;
  const activeCount = sales.filter((sale) => matchesFilter(sale, 'active')).length;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MerchantHeader
          title="Pedidos"
          kicker="GESTÃO DE ENCOMENDAS"
          subtitle="Acompanhe as encomendas com produtos da sua loja e atualize o estado para o cliente."
        />

        <View style={styles.summary}>
          <View style={styles.summaryIcon}><ClipboardList size={19} color={Palette.primaryDark} /></View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>{pendingCount} {pendingCount === 1 ? 'pedido por confirmar' : 'pedidos por confirmar'}</Text>
            <Text style={styles.summaryText}>{activeCount} em preparação ou a caminho · {sales.length} no total</Text>
          </View>
        </View>

        <View style={styles.filters}>
          {filters.map((item) => {
            const selected = filter === item.value;
            const count = sales.filter((sale) => matchesFilter(sale, item.value)).length;
            return (
              <Pressable key={item.value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setFilter(item.value)} style={[styles.filterButton, selected && styles.filterButtonSelected]}>
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item.label}</Text>
                <View style={[styles.filterCount, selected && styles.filterCountSelected]}><Text style={[styles.filterCountText, selected && styles.filterCountTextSelected]}>{count}</Text></View>
              </Pressable>
            );
          })}
        </View>

        {visibleSales.length === 0 ? (
          <MerchantEmptyState
            icon={filter === 'pending' ? <Clock3 size={20} color={Palette.primaryDark} /> : <Package size={20} color={Palette.primaryDark} />}
            title={sales.length ? 'Nenhum pedido neste filtro' : 'Ainda não recebeu pedidos'}
            text={sales.length ? 'Escolha outro filtro para consultar as encomendas da loja.' : 'Quando um cliente comprar um produto da sua loja, o pedido aparece aqui.'}
            actionLabel={sales.length ? undefined : 'VER PRODUTOS'}
            onAction={sales.length ? undefined : () => router.push('/shop/products')}
          />
        ) : visibleSales.map((sale) => {
          const date = new Date(sale.order.createdAt).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });
          const preview = sale.lines.slice(0, 2).map((line) => `${line.quantity}× ${line.name}`).join(' · ');
          return (
            <Pressable
              key={sale.order.id}
              accessibilityRole="button"
              accessibilityLabel={`Abrir pedido ${sale.order.id.slice(-8)}`}
              onPress={() => router.push({ pathname: '/shop/order/[id]', params: { id: sale.order.id } })}
              style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderHeading}>
                  <Text style={styles.orderId}>Pedido #{sale.order.id.slice(-8).toUpperCase()}</Text>
                  <Text style={styles.orderDate}>{date}</Text>
                </View>
                <MerchantStatusPill status={sale.order.status} />
              </View>

              <View style={styles.customerRow}>
                <View style={styles.customerIcon}><UserRound size={14} color={Palette.primaryDark} /></View>
                <Text numberOfLines={1} style={styles.customerName}>{sale.order.delivery.fullName || 'Cliente OWEJI'}</Text>
              </View>
              {sale.order.delivery.municipality || sale.order.delivery.province ? (
                <View style={styles.customerRow}>
                  <View style={styles.customerIcon}><MapPin size={13} color={Palette.primaryDark} /></View>
                  <Text numberOfLines={1} style={styles.customerMeta}>{[sale.order.delivery.municipality, sale.order.delivery.province].filter(Boolean).join(', ')}</Text>
                </View>
              ) : null}

              <View style={styles.items}>
                <View style={styles.itemsIcon}><Package size={17} color={Palette.primaryDark} /></View>
                <View style={styles.itemsCopy}>
                  <Text numberOfLines={1} style={styles.itemsName}>{preview || 'Produtos da loja'}</Text>
                  <Text style={styles.itemsMeta}>{sale.itemCount} {sale.itemCount === 1 ? 'unidade' : 'unidades'} · {formatPrice(sale.value)} para a sua loja</Text>
                </View>
                <ChevronRight size={16} color={Palette.primaryDark} />
              </View>
            </Pressable>
          );
        })}

        <Text style={styles.footnote}>O estado é local e partilhado com a área de pedidos do cliente neste dispositivo. Altere-o no detalhe de cada pedido.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginTop: 16, borderRadius: 15, backgroundColor: Palette.softPink },
  summaryIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Palette.surface },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 10 },
  summaryText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 15, marginBottom: 13 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 13, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  filterButtonSelected: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  filterText: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  filterTextSelected: { color: Palette.surface },
  filterCount: { minWidth: 17, height: 17, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderRadius: 9, backgroundColor: Palette.background },
  filterCountSelected: { backgroundColor: 'rgba(255,255,255,0.24)' },
  filterCountText: { color: Palette.textSecondary, fontFamily: 'Poppins_700Bold', fontSize: 7 },
  filterCountTextSelected: { color: Palette.surface },
  orderCard: { padding: 13, marginBottom: 11, borderRadius: 17, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  orderHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  orderHeading: { flex: 1 },
  orderId: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 11 },
  orderDate: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  customerIcon: { width: 23, height: 23, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: Palette.background },
  customerName: { flex: 1, color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 9 },
  customerMeta: { flex: 1, color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8 },
  items: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 10, marginTop: 10, borderTopWidth: 1, borderTopColor: Palette.border },
  itemsIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Palette.softPink },
  itemsCopy: { flex: 1, minWidth: 0 },
  itemsName: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  itemsMeta: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 3 },
  footnote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, marginTop: 6 },
});
