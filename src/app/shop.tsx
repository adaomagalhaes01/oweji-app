import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft, CircleDollarSign, Package, Plus, Store, Trash2, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { ProductConditionBadge } from '@/components/products/product-condition-badge';
import { productConditionOptions } from '@/features/products/conditions';
import { formatPrice } from '@/features/products/data';
import { shopImages } from '@/features/products/shop-images';
import { useOrdersStore } from '@/store/orders-store';
import { useProfileStore } from '@/store/profile-store';
import { useShopStore, type ShopImageKey } from '@/store/shop-store';
import type { ProductCondition } from '@/features/products/types';

export default function ShopScreen() {
  const storeName = useProfileStore((state) => state.storeName);
  const products = useShopStore((state) => state.products);
  const addProduct = useShopStore((state) => state.addProduct);
  const removeProduct = useShopStore((state) => state.removeProduct);
  const orders = useOrdersStore((state) => state.orders);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageKey, setImageKey] = useState<ShopImageKey>('pink');
  const [condition, setCondition] = useState<ProductCondition | null>(null);
  const priceValue = Number(price.replace(',', '.'));
  const canPost = name.trim().length > 2 && description.trim().length > 5 && priceValue > 0 && condition !== null;
  const sales = useMemo(() => orders.flatMap((order) => order.lines.filter((line) => line.productId.startsWith('seller-')).map((line) => ({ line, orderId: order.id }))), [orders]);
  const salesTotal = sales.reduce((total, sale) => total + sale.line.unitPrice * sale.line.quantity, 0);
  const orderCount = new Set(sales.map((sale) => sale.orderId)).size;
  const submitProduct = () => {
    if (!canPost || !condition) return;
    addProduct({ name: name.trim(), description: description.trim(), price: priceValue, imageKey, condition });
    setName(''); setDescription(''); setPrice(''); setImageKey('pink'); setCondition(null); setAdding(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}><ArrowLeft size={20} color={Palette.text} /></Pressable><View style={styles.headerCopy}><Text style={styles.kicker}>ÁREA DO COMERCIANTE</Text><Text style={styles.title}>{storeName || 'A minha loja'}</Text></View><View style={styles.headerIcon}><Store size={19} color={Palette.primaryDark} /></View></View>
        <Text style={styles.subtitle}>Gerencie os seus produtos e acompanhe o desempenho da loja.</Text>
        <View style={styles.metrics}>
          <Metric icon={<CircleDollarSign size={18} color={Palette.primaryDark} />} label="Vendas" value={formatPrice(salesTotal)} />
          <Metric icon={<TrendingUp size={18} color={Palette.primaryDark} />} label="Pedidos" value={`${orderCount}`} />
          <Metric icon={<Package size={18} color={Palette.primaryDark} />} label="Produtos" value={`${products.length}`} />
        </View>
        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Os seus produtos</Text><Text style={styles.sectionSubtitle}>Os produtos publicados aparecem na coleção.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Adicionar produto" onPress={() => setAdding(!adding)} style={styles.addButton}><Plus size={19} color={Palette.surface} /></Pressable></View>
        {adding ? <View style={styles.form}>
          <Text style={styles.formTitle}>Publicar produto</Text>
          <ShopField label="Nome do produto" value={name} onChangeText={setName} placeholder="Ex.: Blusa de linho" />
          <ShopField label="Descrição" value={description} onChangeText={setDescription} placeholder="Descreva o produto" multiline />
          <ShopField label="Preço (Kz)" value={price} onChangeText={setPrice} placeholder="Ex.: 12500" keyboardType="decimal-pad" />
          <Text style={styles.fieldLabel}>Foto do produto</Text><View style={styles.imageChoices}>{(Object.keys(shopImages) as ShopImageKey[]).map((key) => <Pressable key={key} accessibilityRole="button" accessibilityLabel={`Selecionar foto ${key}`} accessibilityState={{ selected: imageKey === key }} onPress={() => setImageKey(key)} style={[styles.imageChoice, imageKey === key && styles.imageChoiceSelected]}><Image source={shopImages[key]} style={styles.photoPreview} contentFit="cover" /></Pressable>)}</View>
          <Text style={styles.fieldLabel}>Estado da peça</Text><View style={styles.conditionChoices}>{productConditionOptions.map((option) => <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: condition === option.value }} onPress={() => setCondition(option.value)} style={[styles.conditionChoice, condition === option.value && styles.conditionChoiceSelected]}><Text style={[styles.conditionChoiceText, condition === option.value && styles.conditionChoiceTextSelected]}>{option.label}</Text></Pressable>)}</View>
          <Pressable accessibilityRole="button" disabled={!canPost} onPress={submitProduct} style={[styles.publishButton, !canPost && styles.disabled]}><Text style={styles.publishText}>PUBLICAR PRODUTO</Text></Pressable>
        </View> : null}
        {products.length === 0 ? <View style={styles.empty}><Package size={25} color={Palette.primary} /><Text style={styles.emptyTitle}>A sua loja está pronta</Text><Text style={styles.emptyText}>Publique o seu primeiro produto para começar a apresentá-lo na coleção OWEJI.</Text></View> : products.map((product) => <View key={product.id} style={styles.productCard}><View style={styles.productImageWrap}><Image source={shopImages[product.imageKey]} style={styles.productImage} contentFit="cover" /><View pointerEvents="none" style={styles.productCondition}><ProductConditionBadge condition={product.condition ?? 'good-used'} compact /></View></View><View style={styles.productCopy}><Text numberOfLines={1} style={styles.productName}>{product.name}</Text><Text numberOfLines={2} style={styles.productDescription}>{product.description}</Text><Text style={styles.productPrice}>{formatPrice(product.price)}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Remover ${product.name}`} onPress={() => removeProduct(product.id)} hitSlop={8}><Trash2 size={17} color={Palette.textSecondary} /></Pressable></View>)}
        <Text style={styles.sectionTitle}>{orderCount > 0 ? 'Vendas recentes' : 'Acompanhe as suas vendas'}</Text>
        {sales.slice(0, 4).map(({ line, orderId }, index) => <View key={`${orderId}-${line.productId}-${index}`} style={styles.saleRow}><View style={styles.saleIcon}><TrendingUp size={16} color={Palette.primaryDark} /></View><View style={styles.saleCopy}><Text numberOfLines={1} style={styles.saleName}>{line.name}</Text><Text style={styles.saleMeta}>Pedido #{orderId.slice(-5)} · {line.quantity} unidade(s)</Text></View><Text style={styles.saleValue}>{formatPrice(line.unitPrice * line.quantity)}</Text></View>)}
        {orderCount === 0 ? <View style={styles.salesNote}><Text style={styles.salesNoteText}>Os pedidos dos seus produtos e o total vendido vão aparecer aqui quando os clientes finalizarem compras.</Text></View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <View style={styles.metric}>{icon}<Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function ShopField({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'default' | 'decimal-pad' }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Palette.textSecondary} multiline={multiline} keyboardType={keyboardType} style={[styles.input, multiline && styles.multiline]} /></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background }, content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }, header: { flexDirection: 'row', alignItems: 'center', gap: 11 }, back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Palette.surface }, headerCopy: { flex: 1 }, kicker: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 1.5 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 21, marginTop: 2 }, headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Palette.softPink }, subtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, lineHeight: 17, marginTop: 9 },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 18 }, metric: { flex: 1, minHeight: 101, padding: 11, borderRadius: 15, backgroundColor: Palette.surface }, metricValue: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 12, marginTop: 8 }, metricLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 2 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27, marginBottom: 13 }, sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16 }, sectionSubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 3 }, addButton: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary },
  form: { padding: 15, borderRadius: 17, marginBottom: 13, backgroundColor: Palette.surface }, formTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 14, marginBottom: 9 }, field: { marginTop: 9 }, fieldLabel: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginBottom: 5 }, input: { minHeight: 43, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Palette.background, borderWidth: 1, borderColor: Palette.border, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 11 }, multiline: { minHeight: 67, paddingTop: 10, textAlignVertical: 'top' }, imageChoices: { flexDirection: 'row', gap: 10, marginTop: 7, marginBottom: 4 }, imageChoice: { width: 52, height: 61, padding: 3, borderRadius: 11, borderWidth: 1, borderColor: Palette.border }, imageChoiceSelected: { borderColor: Palette.primary, borderWidth: 2 }, photoPreview: { width: '100%', height: '100%', borderRadius: 7 }, conditionChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 5 }, conditionChoice: { paddingHorizontal: 9, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.background }, conditionChoiceSelected: { borderColor: Palette.primary, backgroundColor: Palette.softPink }, conditionChoiceText: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 9 }, conditionChoiceTextSelected: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold' }, publishButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 13, marginTop: 14, backgroundColor: Palette.primary }, publishText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 0.4 }, disabled: { opacity: 0.45 },
  productCard: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 10, padding: 10, borderRadius: 15, backgroundColor: Palette.surface }, productImageWrap: { width: 58, height: 68, borderRadius: 10, overflow: 'hidden', backgroundColor: Palette.softPink }, productImage: { width: '100%', height: '100%' }, productCondition: { position: 'absolute', top: 3, left: 3, maxWidth: '90%' }, productCopy: { flex: 1 }, productName: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11 }, productDescription: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 3 }, productPrice: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 11, marginTop: 4 }, empty: { alignItems: 'center', padding: 21, borderRadius: 16, backgroundColor: Palette.surface }, emptyTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 13, marginTop: 8 }, emptyText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, textAlign: 'center', lineHeight: 16, marginTop: 5 }, salesNote: { padding: 15, marginTop: 10, borderRadius: 15, backgroundColor: Palette.softPink }, salesNoteText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, lineHeight: 16 }, saleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, marginBottom: 8, borderRadius: 14, backgroundColor: Palette.surface }, saleIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Palette.softPink }, saleCopy: { flex: 1 }, saleName: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, saleMeta: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 }, saleValue: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 9 },
});
