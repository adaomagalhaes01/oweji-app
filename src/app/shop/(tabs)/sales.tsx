import { router } from 'expo-router';
import { ChevronRight, CircleDollarSign, PackageCheck, ReceiptText, TrendingUp } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Rect } from 'react-native-svg';

import { MerchantHeader } from '@/components/merchant/merchant-header';
import { MerchantEmptyState, MerchantMetric, MerchantStatusPill } from '@/components/merchant/merchant-ui';
import { Palette } from '@/constants/palette';
import { getMerchantProducts, getMerchantSales } from '@/features/merchant/metrics';
import { formatPrice } from '@/features/products/data';
import { useOrdersStore } from '@/store/orders-store';
import { useProfileStore } from '@/store/profile-store';
import { useShopStore } from '@/store/shop-store';

export default function MerchantSalesScreen() {
  const storeId = useProfileStore((state) => state.storeId);
  const products = useShopStore((state) => state.products);
  const orders = useOrdersStore((state) => state.orders);

  const merchantProducts = useMemo(() => getMerchantProducts(products, storeId), [products, storeId]);
  const ownedProductIds = useMemo(() => merchantProducts.map((product) => `seller-${product.id}`), [merchantProducts]);
  const sales = useMemo(() => getMerchantSales(orders, storeId, ownedProductIds).filter((sale) => sale.order.status === 'delivered'), [orders, storeId, ownedProductIds]);
  const total = sales.reduce((sum, sale) => sum + sale.value, 0);
  const items = sales.reduce((sum, sale) => sum + sale.itemCount, 0);
  const average = sales.length ? total / sales.length : 0;
  const dailySales = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const nextDay = day.getTime() + 24 * 60 * 60 * 1000;
    const value = sales.reduce((sum, sale) => sale.order.createdAt >= day.getTime() && sale.order.createdAt < nextDay ? sum + sale.value : sum, 0);
    return { day, value };
  });
  const maxDailySales = Math.max(1, ...dailySales.map((item) => item.value));
  const bestProducts = (() => {
    const totals = new Map<string, { name: string; quantity: number; value: number }>();
    sales.forEach((sale) => sale.lines.forEach((line) => {
      const current = totals.get(line.productId) ?? { name: line.name, quantity: 0, value: 0 };
      current.quantity += line.quantity;
      current.value += line.unitPrice * line.quantity;
      totals.set(line.productId, current);
    }));
    return [...totals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  })();
  const recentSales = sales.slice(0, 5);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MerchantHeader
          title="Vendas"
          kicker="DESEMPENHO DA LOJA"
          subtitle="Consulte as peças vendidas e o valor que corresponde à sua loja em cada pedido."
        />

        <View style={styles.metrics}>
          <MerchantMetric icon={<CircleDollarSign size={18} color={Palette.primaryDark} />} label="Receita" value={formatPrice(total)} />
          <MerchantMetric icon={<TrendingUp size={18} color={Palette.primaryDark} />} label="Pedidos" value={`${sales.length}`} />
          <MerchantMetric icon={<PackageCheck size={18} color={Palette.primaryDark} />} label="Peças" value={`${items}`} />
        </View>
        <Text style={styles.metricsNote}>Ticket médio por pedido: {formatPrice(average)}. Valores calculados apenas com as linhas dos seus produtos.</Text>

        <View style={styles.chartCard}>
          <View style={styles.chartHeading}><View><Text style={styles.chartTitle}>Vendas nos últimos 7 dias</Text><Text style={styles.chartSubtitle}>Receita diária da sua loja</Text></View><TrendingUp size={18} color={Palette.primaryDark} /></View>
          <Svg width="100%" height={120} viewBox="0 0 320 120" preserveAspectRatio="none">
            <Line x1="8" y1="106" x2="312" y2="106" stroke={Palette.border} strokeWidth="1" />
            {dailySales.map((item, index) => {
              const height = item.value ? Math.max(5, (item.value / maxDailySales) * 82) : 3;
              return <Rect key={item.day.toISOString()} x={20 + index * 43} y={106 - height} width="22" height={height} rx="6" fill={item.value ? Palette.primary : Palette.border} />;
            })}
          </Svg>
          <View style={styles.chartLabels}>{dailySales.map((item) => <Text key={item.day.toISOString()} style={styles.chartLabel}>{item.day.toLocaleDateString('pt-AO', { weekday: 'short' }).replace('.', '').slice(0, 3)}</Text>)}</View>
        </View>

        <View style={styles.bestCard}>
          <View style={styles.sectionHeaderCompact}><View><Text style={styles.chartTitle}>Produtos mais vendidos</Text><Text style={styles.chartSubtitle}>Ordenados pelas unidades vendidas</Text></View><PackageCheck size={17} color={Palette.primaryDark} /></View>
          {bestProducts.length ? bestProducts.map((product, index) => <View key={`${product.name}-${index}`} style={styles.bestRow}><View style={styles.bestRank}><Text style={styles.bestRankText}>{index + 1}</Text></View><Text numberOfLines={1} style={styles.bestName}>{product.name}</Text><Text style={styles.bestCount}>{product.quantity} un.</Text></View>) : <Text style={styles.noBest}>Os produtos mais vendidos aparecem aqui após as primeiras vendas.</Text>}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Histórico de vendas</Text>
            <Text style={styles.sectionSubtitle}>As 5 vendas mais recentes.</Text>
          </View>
          <View style={styles.historyIcon}><ReceiptText size={17} color={Palette.primaryDark} /></View>
        </View>

        {recentSales.length === 0 ? (
          <MerchantEmptyState
            icon={<TrendingUp size={20} color={Palette.primaryDark} />}
            title="Ainda sem vendas registadas"
            text="Quando um cliente finalizar um pedido com produtos da sua loja, a venda aparece nesta área."
            actionLabel="VER PRODUTOS"
            onAction={() => router.push('/shop/products')}
          />
        ) : recentSales.map((sale) => (
          <Pressable
            key={sale.order.id}
            accessibilityRole="button"
            accessibilityLabel={`Abrir venda do pedido ${sale.order.id.slice(-5)}`}
            onPress={() => router.push({ pathname: '/shop/order/[id]', params: { id: sale.order.id } })}
            style={styles.saleCard}>
            <View style={styles.saleHeader}>
              <View style={styles.saleHeading}>
                <Text style={styles.saleId}>Pedido #{sale.order.id.slice(-8).toUpperCase()}</Text>
                <Text style={styles.saleDate}>{new Date(sale.order.createdAt).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
              </View>
              <MerchantStatusPill status={sale.order.status} />
            </View>

            <View style={styles.lines}>
              {sale.lines.map((line, index) => (
                <View key={`${line.productId}-${line.size}-${line.color}-${index}`} style={styles.line}>
                  <View style={styles.quantity}><Text style={styles.quantityText}>{line.quantity}×</Text></View>
                  <View style={styles.lineCopy}>
                    <Text numberOfLines={1} style={styles.lineName}>{line.name}</Text>
                    <Text style={styles.lineMeta}>{[line.size, line.color].filter(Boolean).join(' · ') || 'Sem opções'} · {formatPrice(line.unitPrice)}/un.</Text>
                  </View>
                  <Text style={styles.lineValue}>{formatPrice(line.unitPrice * line.quantity)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.saleFooter}>
              <View>
                <Text style={styles.totalLabel}>Total da sua loja</Text>
                <Text style={styles.totalItems}>{sale.itemCount} {sale.itemCount === 1 ? 'unidade' : 'unidades'}</Text>
              </View>
              <View style={styles.saleAction}>
                <Text style={styles.saleTotal}>{formatPrice(sale.value)}</Text>
                <ChevronRight size={15} color={Palette.primaryDark} />
              </View>
            </View>
          </Pressable>
        ))}

        <Text style={styles.footnote}>O total do pedido pode incluir produtos de outras lojas. Aqui são apresentados apenas os artigos associados à sua loja. O estado do pedido é actualizado na área de pedidos.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 18 },
  metricsNote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, lineHeight: 14, marginTop: 8 },
  chartCard: { padding: 14, marginTop: 17, borderRadius: 17, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  chartHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 13 },
  chartSubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 2 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -2 },
  chartLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 9, textTransform: 'capitalize' },
  bestCard: { padding: 14, marginTop: 11, borderRadius: 17, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  sectionHeaderCompact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  bestRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Palette.border },
  bestRank: { width: 23, height: 23, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: Palette.softPink },
  bestRankText: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 10 },
  bestName: { flex: 1, color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 11 },
  bestCount: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 10 },
  noBest: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, lineHeight: 14, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 12 },
  sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16 },
  sectionSubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 3 },
  historyIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Palette.softPink },
  saleCard: { padding: 13, marginBottom: 11, borderRadius: 17, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  saleHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  saleHeading: { flex: 1 },
  saleId: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 13 },
  saleDate: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 2 },
  lines: { marginTop: 10, paddingTop: 4, borderTopWidth: 1, borderTopColor: Palette.border },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  quantity: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: Palette.background },
  quantityText: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 10 },
  lineCopy: { flex: 1, minWidth: 0 },
  lineName: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  lineMeta: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 2 },
  lineValue: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  saleFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, paddingTop: 9, marginTop: 4, borderTopWidth: 1, borderTopColor: Palette.border },
  totalLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 10 },
  totalItems: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 2 },
  saleAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  saleTotal: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 13 },
  footnote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, lineHeight: 14, marginTop: 6 },
});
