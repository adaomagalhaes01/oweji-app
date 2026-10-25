import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ChevronRight,
  CircleDollarSign,
  Package,
  Plus,
  ShoppingBag,
  Store,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantHeader } from '@/components/merchant/merchant-header';
import { MerchantEmptyState, MerchantMetric, MerchantStatusPill } from '@/components/merchant/merchant-ui';
import { Palette } from '@/constants/palette';
import { getMerchantProducts, getMerchantSales } from '@/features/merchant/metrics';
import { formatPrice } from '@/features/products/data';
import { getShopProductImage } from '@/features/products/shop-images';
import { useOrdersStore } from '@/store/orders-store';
import { useProfileStore } from '@/store/profile-store';
import { useShopStore } from '@/store/shop-store';

export default function MerchantDashboardScreen() {
  const storeName = useProfileStore((state) => state.storeName);
  const storeId = useProfileStore((state) => state.storeId);
  const orders = useOrdersStore((state) => state.orders);
  const products = useShopStore((state) => state.products);

  const merchantProducts = useMemo(() => getMerchantProducts(products, storeId), [products, storeId]);
  const ownedProductIds = useMemo(() => merchantProducts.map((product) => `seller-${product.id}`), [merchantProducts]);
  const sales = useMemo(() => getMerchantSales(orders, storeId, ownedProductIds), [orders, storeId, ownedProductIds]);
  const salesTotal = sales.reduce((total, sale) => total + sale.value, 0);
  const stockTotal = merchantProducts.reduce((total, product) => total + product.stock, 0);
  const lowStock = merchantProducts.filter((product) => product.stock > 0 && product.stock <= 3);
  const recentSales = sales.slice(0, 4);
  const recentProducts = merchantProducts.slice(0, 3);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MerchantHeader
          title={storeName || 'A minha loja'}
          subtitle="Gerencie o catálogo, acompanhe as vendas e responda aos pedidos dos clientes."
        />

        <View style={styles.metrics}>
          <MerchantMetric icon={<CircleDollarSign size={18} color={Palette.primaryDark} />} label="Vendas" value={formatPrice(salesTotal)} />
          <MerchantMetric icon={<TrendingUp size={18} color={Palette.primaryDark} />} label="Pedidos" value={`${sales.length}`} />
          <MerchantMetric icon={<Package size={18} color={Palette.primaryDark} />} label="Produtos" value={`${merchantProducts.length}`} />
        </View>
        <Text style={styles.metricsNote}>Dados locais desta loja. {stockTotal} {stockTotal === 1 ? 'unidade em stock' : 'unidades em stock'} no total.</Text>

        {lowStock.length ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/shop/products')} style={styles.lowStock}>
            <View style={styles.lowStockIcon}><TriangleAlert size={17} color="#805B20" /></View>
            <View style={styles.lowStockCopy}>
              <Text style={styles.lowStockTitle}>Stock quase a terminar</Text>
              <Text style={styles.lowStockText}>{lowStock.map((product) => `${product.name} (${product.stock})`).join(' · ')}</Text>
            </View>
            <ChevronRight size={16} color="#805B20" />
          </Pressable>
        ) : null}

        <View style={styles.quickActions}>
          <QuickAction icon={<Plus size={18} color={Palette.primaryDark} />} label="Novo produto" onPress={() => router.push('/shop/products')} />
          <QuickAction icon={<ShoppingBag size={18} color={Palette.primaryDark} />} label="Ver pedidos" onPress={() => router.push('/shop/orders')} />
          <QuickAction icon={<Store size={18} color={Palette.primaryDark} />} label="Editar loja" onPress={() => router.push('/shop/profile')} />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Vendas recentes</Text>
            <Text style={styles.sectionSubtitle}>Apenas as linhas dos seus produtos.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/shop/sales')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </Pressable>
        </View>

        {recentSales.length === 0 ? (
          <MerchantEmptyState
            icon={<TrendingUp size={19} color={Palette.primaryDark} />}
            title="Ainda sem vendas"
            text="Quando um cliente comprar um produto da sua loja, a venda aparece aqui."
          />
        ) : recentSales.map((sale) => (
          <Pressable
            key={sale.order.id}
            accessibilityRole="button"
            accessibilityLabel={`Abrir pedido ${sale.order.id.slice(-5)}`}
            onPress={() => router.push({ pathname: '/shop/order/[id]', params: { id: sale.order.id } })}
            style={styles.saleRow}>
            <View style={styles.saleIcon}><TrendingUp size={16} color={Palette.primaryDark} /></View>
            <View style={styles.saleCopy}>
              <View style={styles.saleTop}>
                <Text numberOfLines={1} style={styles.saleName}>Pedido #{sale.order.id.slice(-5).toUpperCase()}</Text>
                <MerchantStatusPill status={sale.order.status} />
              </View>
              <Text style={styles.saleMeta}>{new Date(sale.order.createdAt).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })} · {sale.itemCount} {sale.itemCount === 1 ? 'unidade' : 'unidades'}</Text>
              <Text numberOfLines={1} style={styles.saleMeta}>{sale.lines.map((line) => line.name).join(' · ')}</Text>
            </View>
            <View style={styles.saleValueWrap}>
              <Text style={styles.saleValue}>{formatPrice(sale.value)}</Text>
              <ChevronRight size={15} color={Palette.textSecondary} />
            </View>
          </Pressable>
        ))}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Os seus produtos</Text>
            <Text style={styles.sectionSubtitle}>Actualizado no catálogo OWEJI.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/shop/products')}>
            <Text style={styles.seeAll}>Gerir</Text>
          </Pressable>
        </View>

        {recentProducts.length === 0 ? (
          <MerchantEmptyState
            icon={<Package size={19} color={Palette.primaryDark} />}
            title="A sua loja ainda não tem produtos"
            text="Publique a primeira peça com fotografia, preço, tamanhos, cores e stock."
            actionLabel="PUBLICAR PRODUTO"
            onAction={() => router.push('/shop/products')}
          />
        ) : recentProducts.map((product) => (
          <Pressable
            key={product.id}
            accessibilityRole="button"
            accessibilityLabel={`Gerir ${product.name}`}
            onPress={() => router.push('/shop/products')}
            style={styles.productRow}>
            <Image source={getShopProductImage(product)} style={styles.productImage} contentFit="cover" />
            <View style={styles.productCopy}>
              <Text numberOfLines={1} style={styles.productName}>{product.name}</Text>
              <Text style={styles.productMeta}>{formatPrice(product.price)} · {product.stock} em stock</Text>
              <Text numberOfLines={1} style={styles.productMeta}>{product.sizes.join(' · ')}</Text>
            </View>
            <View style={[styles.stockPill, product.stock === 0 && styles.stockPillEmpty]}>
              <Text style={[styles.stockPillText, product.stock === 0 && styles.stockPillTextEmpty]}>{product.stock === 0 ? 'Esgotado' : 'Activo'}</Text>
            </View>
          </Pressable>
        ))}

        <Text style={styles.footnote}>O histórico e os valores são calculados a partir dos pedidos guardados neste dispositivo. Pagamentos ainda não são confirmados automaticamente.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.quickAction}>
      <View style={styles.quickActionIcon}>{icon}</View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 18 },
  metricsNote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, lineHeight: 14, marginTop: 8 },
  lowStock: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, marginTop: 12, borderRadius: 14, backgroundColor: '#FFF1D9' },
  lowStockIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#FFE4B5' },
  lowStockCopy: { flex: 1 },
  lowStockTitle: { color: '#805B20', fontFamily: 'Poppins_700Bold', fontSize: 9 },
  lowStockText: { color: '#805B20', fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 },
  quickActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  quickAction: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 14, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  quickActionIcon: { width: 33, height: 33, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Palette.softPink },
  quickActionLabel: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 8, textAlign: 'center', marginTop: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 11 },
  sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16 },
  sectionSubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 3 },
  seeAll: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  saleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, marginBottom: 8, borderRadius: 14, backgroundColor: Palette.surface },
  saleIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Palette.softPink },
  saleCopy: { flex: 1 },
  saleTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  saleName: { flex: 1, color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  saleMeta: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 },
  saleValueWrap: { alignItems: 'flex-end', gap: 2 },
  saleValue: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 9 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 9, marginBottom: 8, borderRadius: 14, backgroundColor: Palette.surface },
  productImage: { width: 48, height: 58, borderRadius: 9, backgroundColor: Palette.softPink },
  productCopy: { flex: 1 },
  productName: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  productMeta: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 3 },
  stockPill: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8, backgroundColor: '#E5F3EA' },
  stockPillEmpty: { backgroundColor: '#FCE7EC' },
  stockPillText: { color: '#286744', fontFamily: 'Poppins_600SemiBold', fontSize: 7 },
  stockPillTextEmpty: { color: Palette.error },
  footnote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, marginTop: 10 },
});
