import { router } from 'expo-router';
import { ChevronRight, CircleDollarSign, PackageCheck, ReceiptText, TrendingUp } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const sales = useMemo(() => getMerchantSales(orders, storeId, ownedProductIds), [orders, storeId, ownedProductIds]);
  const total = sales.reduce((sum, sale) => sum + sale.value, 0);
  const items = sales.reduce((sum, sale) => sum + sale.itemCount, 0);
  const average = sales.length ? total / sales.length : 0;

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

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Histórico de vendas</Text>
            <Text style={styles.sectionSubtitle}>Da mais recente para a mais antiga.</Text>
          </View>
          <View style={styles.historyIcon}><ReceiptText size={17} color={Palette.primaryDark} /></View>
        </View>

        {sales.length === 0 ? (
          <MerchantEmptyState
            icon={<TrendingUp size={20} color={Palette.primaryDark} />}
            title="Ainda sem vendas registadas"
            text="Quando um cliente finalizar um pedido com produtos da sua loja, a venda aparece nesta área."
            actionLabel="VER PRODUTOS"
            onAction={() => router.push('/shop/products')}
          />
        ) : sales.map((sale) => (
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
  metricsNote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, lineHeight: 14, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 12 },
  sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16 },
  sectionSubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 3 },
  historyIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Palette.softPink },
  saleCard: { padding: 13, marginBottom: 11, borderRadius: 17, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  saleHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  saleHeading: { flex: 1 },
  saleId: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 11 },
  saleDate: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 },
  lines: { marginTop: 10, paddingTop: 4, borderTopWidth: 1, borderTopColor: Palette.border },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  quantity: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: Palette.background },
  quantityText: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 8 },
  lineCopy: { flex: 1, minWidth: 0 },
  lineName: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  lineMeta: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 },
  lineValue: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  saleFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, paddingTop: 9, marginTop: 4, borderTopWidth: 1, borderTopColor: Palette.border },
  totalLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 8 },
  totalItems: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 },
  saleAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  saleTotal: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 12 },
  footnote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, marginTop: 6 },
});
