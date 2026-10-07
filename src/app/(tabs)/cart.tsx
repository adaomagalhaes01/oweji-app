import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react-native';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { formatPrice } from '@/features/products/data';
import { getProductCatalog } from '@/features/products/catalog';
import { useCartStore } from '@/store/cart-store';
import type { CartItem } from '@/store/cart-store';
import { useShopStore } from '@/store/shop-store';
import { useOrdersStore } from '@/store/orders-store';

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrdersStore((state) => state.addOrder);
  const catalog = getProductCatalog(useShopStore((state) => state.products));
  const subtotal = items.reduce((sum, item) => sum + (catalog.find((product) => product.id === item.productId)?.price ?? 0) * item.quantity, 0);
  const shipping = items.length ? 500 : 0;
  const checkout = () => Alert.alert('Confirmar pedido', 'O pedido será guardado na aplicação. O pagamento será combinado fora do app nesta etapa.', [
    { text: 'Voltar', style: 'cancel' },
    { text: 'Confirmar pedido', onPress: () => {
      const orderLines = items.flatMap((item) => {
        const product = catalog.find((entry) => entry.id === item.productId);
        return product ? [{ productId: product.id, name: product.name, unitPrice: product.price, quantity: item.quantity }] : [];
      });
      addOrder({ lines: orderLines, total: subtotal + shipping });
      clearCart();
      Alert.alert('Pedido registado', 'O seu pedido foi guardado. O pagamento ainda não foi processado no aplicativo.');
    } },
  ]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.productId}-${item.size}-${item.color}`}
        renderItem={({ item }) => <CartRow item={item} updateQuantity={updateQuantity} removeItem={removeItem} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={styles.heading}><Text style={styles.kicker}>AS SUAS ESCOLHAS</Text><Text style={styles.title}>Meu carrinho</Text><Text style={styles.subtitle}>{items.length} {items.length === 1 ? 'peça' : 'peças'} selecionadas</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><ShoppingBag size={30} color={Palette.primary} /><Text style={styles.emptyTitle}>O seu carrinho está vazio</Text><Text style={styles.emptyText}>Descubra peças especiais e comece a montar o seu look.</Text><Pressable onPress={() => router.replace('/')} style={styles.shopButton}><Text style={styles.shopText}>EXPLORAR PEÇAS</Text></Pressable></View>}
        ListFooterComponent={items.length ? <View style={styles.summary}><Text style={styles.summaryTitle}>Resumo do pedido</Text><SummaryRow label="Subtotal" value={formatPrice(subtotal)} /><SummaryRow label="Entrega estimada" value={formatPrice(shipping)} /><View style={styles.divider} /><SummaryRow label="Total" value={formatPrice(subtotal + shipping)} bold /><Pressable accessibilityRole="button" onPress={checkout} style={styles.checkout}><Text style={styles.checkoutText}>FINALIZAR COMPRA</Text></Pressable><Text style={styles.checkoutHint}>Checkout demonstrativo · sem pagamento real</Text></View> : null}
      />
    </SafeAreaView>
  );
}

function CartRow({ item, updateQuantity, removeItem }: { item: CartItem; updateQuantity: (id: string, size: string, color: string, quantity: number) => void; removeItem: (id: string, size: string, color: string) => void }) {
  const sellerProducts = useShopStore((state) => state.products);
  const product = getProductCatalog(sellerProducts).find((entry) => entry.id === item.productId);
  if (!product) return null;
  return (
    <View style={styles.itemCard}>
      <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}>
        <Image source={product.image} style={styles.itemImage} contentFit="cover" />
      </Pressable>
      <View style={styles.itemDetails}>
        <View style={styles.itemTop}><Text numberOfLines={2} style={styles.itemName}>{product.name}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Remover ${product.name}`} onPress={() => removeItem(item.productId, item.size, item.color)} hitSlop={8}><Trash2 size={17} color={Palette.textSecondary} /></Pressable></View>
        <Text style={styles.itemPrice}>{formatPrice(product.price)}</Text>
        <Text style={styles.itemOption}>Tamanho {item.size}</Text>
        <View style={styles.quantityControls}><Pressable accessibilityRole="button" accessibilityLabel="Diminuir quantidade" onPress={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)} style={styles.quantityButton}><Minus size={13} color={Palette.text} /></Pressable><Text style={styles.quantity}>{item.quantity}</Text><Pressable accessibilityRole="button" accessibilityLabel="Aumentar quantidade" onPress={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)} style={styles.quantityButton}><Plus size={13} color={Palette.text} /></Pressable></View>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return <View style={styles.summaryRow}><Text style={[styles.summaryLabel, bold && styles.totalLabel]}>{label}</Text><Text style={[styles.summaryValue, bold && styles.totalValue]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background }, content: { paddingHorizontal: 20, paddingBottom: 28 },
  heading: { paddingTop: 18, paddingBottom: 21 }, kicker: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 1.7 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 27, marginTop: 5 }, subtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 4 },
  itemCard: { flexDirection: 'row', padding: 11, gap: 13, marginBottom: 12, borderRadius: 17, backgroundColor: Palette.surface }, itemImage: { width: 92, height: 116, borderRadius: 12, backgroundColor: Palette.softPink }, itemDetails: { flex: 1, paddingVertical: 2 }, itemTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }, itemName: { flex: 1, color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 13 }, itemPrice: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 13, marginTop: 5 }, itemOption: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 3 }, quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 10 }, quantityButton: { width: 28, height: 28, borderRadius: 10, borderWidth: 1, borderColor: Palette.border, alignItems: 'center', justifyContent: 'center' }, quantity: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  summary: { marginTop: 14, padding: 18, borderRadius: 18, backgroundColor: Palette.surface }, summaryTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16, marginBottom: 13 }, summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 5 }, summaryLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12 }, summaryValue: { color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 12 }, divider: { height: 1, backgroundColor: Palette.border, marginVertical: 10 }, totalLabel: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 13 }, totalValue: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 15 }, checkout: { minHeight: 51, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderRadius: 15, marginTop: 16 }, checkoutText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 0.5 }, checkoutHint: { textAlign: 'center', color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 8 },
  empty: { alignItems: 'center', paddingHorizontal: 18, paddingVertical: 35, borderRadius: 20, backgroundColor: Palette.surface }, emptyTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16, marginTop: 13 }, emptyText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', textAlign: 'center', fontSize: 12, lineHeight: 19, marginTop: 6 }, shopButton: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 14, backgroundColor: Palette.primary }, shopText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 11, letterSpacing: 0.4 },
});
