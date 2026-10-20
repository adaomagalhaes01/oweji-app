import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Minus, Plus, Ruler, ShoppingBag, Star } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { ProductConditionBadge } from '@/components/products/product-condition-badge';
import { categories, formatPrice } from '@/features/products/data';
import { getProductCatalog } from '@/features/products/catalog';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { useShopStore } from '@/store/shop-store';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height } = useWindowDimensions();
  const imageHeight = Math.min(500, Math.max(330, height * 0.46));
  const sellerProducts = useShopStore((state) => state.products);
  const catalog = useMemo(() => getProductCatalog(sellerProducts), [sellerProducts]);
  const product = useMemo(() => catalog.find((entry) => entry.id === id), [catalog, id]);
  const [size, setSize] = useState(product?.sizes[0] ?? '');
  const [color, setColor] = useState(product?.colors[0] ?? '');
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const isFavorite = useFavoritesStore((state) => state.productIds.includes(id ?? ''));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  if (!product) return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><Text style={styles.title}>Peça não encontrada</Text><Pressable onPress={() => router.back()}><Text style={styles.link}>Voltar à coleção</Text></Pressable></View></SafeAreaView>;

  const addSelection = () => {
    for (let index = 0; index < quantity; index += 1) addItem({ productId: product.id, size, color });
  };
  const categoryLabel = categories.find((category) => category.id === product.category)?.label ?? 'Coleção OWEJI';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.imageWrap, { height: imageHeight }]}>
          <Image source={product.image} style={styles.image} contentFit="cover" transition={200} accessibilityLabel={product.name} />
          <View style={styles.imageShade} />
          <View pointerEvents="none" style={styles.conditionBadge}><ProductConditionBadge condition={product.condition} /></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={[styles.floatingButton, styles.backButton]}><ArrowLeft size={20} color={Palette.text} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} accessibilityState={{ selected: isFavorite }} onPress={() => toggleFavorite(product.id)} style={[styles.floatingButton, styles.heartButton]}><Heart size={20} color={Palette.primaryDark} fill={isFavorite ? Palette.primary : 'transparent'} /></Pressable>
          <View style={styles.imageCaption}><Text style={styles.imageKicker}>OWEJI · {categoryLabel.toLocaleUpperCase('pt-AO')}</Text><Text style={styles.imageHint}>Detalhes que fazem a diferença</Text></View>
        </View>
        <View style={styles.details}>
          <Text style={styles.category}>{categoryLabel.toLocaleUpperCase('pt-AO')}</Text>
          <View style={styles.nameLine}><Text style={styles.productName}>{product.name}</Text>{product.rating > 0 ? <View style={styles.rating}><Star size={14} color={Palette.warning} fill={Palette.warning} /><Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text></View> : null}</View>
          <View style={styles.priceLine}><Text style={styles.price}>{formatPrice(product.price)}</Text><Text style={styles.priceCaption}>Preço por unidade</Text></View>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.sectionDivider} />
          <View style={styles.optionHeading}><View><Text style={styles.optionTitle}>Escolha o tamanho</Text><Text style={styles.optionHint}>Tamanho selecionado: {size}</Text></View><Pressable accessibilityRole="button" onPress={() => Alert.alert('Guia de tamanhos', 'XS · extra pequeno    S · pequeno    M · médio    L · grande    XL · extra grande')} style={styles.sizeGuide}><Ruler size={14} color={Palette.primaryDark} /><Text style={styles.sizeGuideText}>Guia</Text></Pressable></View>
          <View style={styles.sizes}>{product.sizes.map((option) => <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: size === option }} onPress={() => setSize(option)} style={[styles.sizeButton, size === option && styles.sizeSelected]}><Text style={[styles.sizeText, size === option && styles.sizeTextSelected]}>{option}</Text></Pressable>)}</View>

          <View style={styles.sectionDivider} />
          <View style={styles.optionHeading}><View><Text style={styles.optionTitle}>Cor</Text><Text style={styles.optionHint}>Selecione a sua preferida</Text></View></View>
          <View style={styles.colors}>{product.colors.map((option, index) => <Pressable key={option} accessibilityRole="button" accessibilityLabel={`Selecionar cor ${option}`} accessibilityState={{ selected: color === option }} onPress={() => setColor(option)} style={styles.colorOption}><View style={[styles.colorOuter, color === option && styles.colorSelected]}><View style={[styles.colorDot, { backgroundColor: option }]} /></View><Text style={styles.colorLabel}>{index === 0 ? 'Cor 1' : `Cor ${index + 1}`}</Text></Pressable>)}</View>

          <View style={styles.stockCard}><View style={[styles.availabilityDot, !product.available && styles.unavailable]} /><View style={styles.stockCopy}><Text style={styles.stockTitle}>{product.available ? 'Disponível para compra' : 'Indisponível no momento'}</Text><Text style={styles.stockHint}>{product.available ? 'Adicione ao carrinho para reservar esta peça.' : 'Esta peça não pode ser adicionada agora.'}</Text></View></View>
          <View style={styles.quantityCard}><View><Text style={styles.optionTitle}>Quantidade</Text><Text style={styles.totalLabel}>Total · {formatPrice(product.price * quantity)}</Text></View><View style={styles.quantityControls}><Pressable accessibilityRole="button" accessibilityLabel="Diminuir quantidade" onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.quantityButton}><Minus size={15} color={Palette.text} /></Pressable><Text style={styles.quantity}>{quantity}</Text><Pressable accessibilityRole="button" accessibilityLabel="Aumentar quantidade" onPress={() => setQuantity(quantity + 1)} style={styles.quantityButton}><Plus size={15} color={Palette.text} /></Pressable></View></View>
        </View>
      </ScrollView>
      <View style={styles.footer}><Pressable accessibilityRole="button" disabled={!product.available} onPress={addSelection} style={[styles.primaryButton, !product.available && styles.disabled]}><ShoppingBag size={18} color={Palette.surface} /><Text style={styles.primaryButtonText}>ADICIONAR AO CARRINHO</Text></Pressable><Pressable accessibilityRole="button" disabled={!product.available} onPress={() => { addSelection(); router.push('/cart'); }} style={[styles.buyButton, !product.available && styles.disabled]}><Text style={styles.buyText}>COMPRAR AGORA</Text></Pressable></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background }, scrollContent: { paddingBottom: 20 },
  imageWrap: { overflow: 'hidden', backgroundColor: Palette.softPink, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }, image: { width: '100%', height: '100%' }, imageShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(38, 24, 31, 0.08)' }, imageCaption: { position: 'absolute', left: 22, right: 22, bottom: 19 }, imageKicker: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 1.6 }, imageHint: { color: Palette.surface, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 3 },
  floatingButton: { position: 'absolute', top: 14, width: 43, height: 43, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.96)' }, backButton: { left: 18 }, heartButton: { right: 18 }, conditionBadge: { position: 'absolute', top: 68, left: 18, maxWidth: '70%' },
  details: { paddingHorizontal: 22, paddingTop: 21 }, category: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 1.5, marginBottom: 7 }, nameLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, productName: { flex: 1, color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 21, lineHeight: 28 }, rating: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12, backgroundColor: Palette.surface }, ratingText: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12 }, priceLine: { flexDirection: 'row', alignItems: 'baseline', gap: 9, marginTop: 8 }, price: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 21 }, priceCaption: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10 }, description: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 20, marginTop: 9 }, sectionDivider: { height: 1, backgroundColor: Palette.border, marginVertical: 18 },
  optionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }, optionTitle: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 13 }, optionHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 3 }, sizeGuide: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, backgroundColor: Palette.surface }, sizeGuideText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, sizeButton: { minWidth: 48, height: 43, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }, sizeSelected: { backgroundColor: Palette.primary, borderColor: Palette.primary }, sizeText: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 12 }, sizeTextSelected: { color: Palette.surface }, colors: { flexDirection: 'row', gap: 15 }, colorOption: { alignItems: 'center', gap: 4 }, colorOuter: { width: 38, height: 38, borderRadius: 20, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' }, colorSelected: { borderColor: Palette.primaryDark }, colorDot: { width: 27, height: 27, borderRadius: 14, borderWidth: 1, borderColor: Palette.border }, colorLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9 },
  stockCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, marginTop: 20, borderRadius: 15, backgroundColor: Palette.surface }, availabilityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.success }, unavailable: { backgroundColor: Palette.error }, stockCopy: { flex: 1 }, stockTitle: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11 }, stockHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 2 }, quantityCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, marginTop: 10, borderRadius: 15, backgroundColor: Palette.surface }, totalLabel: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginTop: 3 }, quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 13 }, quantityButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: Palette.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Palette.border }, quantity: { minWidth: 15, textAlign: 'center', color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  footer: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 8, backgroundColor: Palette.background, gap: 8, borderTopWidth: 1, borderTopColor: Palette.border }, primaryButton: { minHeight: 51, borderRadius: 15, backgroundColor: Palette.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9 }, primaryButtonText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 11, letterSpacing: 0.6 }, buyButton: { minHeight: 44, borderRadius: 15, borderWidth: 1, borderColor: Palette.primary, justifyContent: 'center', alignItems: 'center' }, buyText: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 11, letterSpacing: 0.6 }, disabled: { opacity: 0.45 }, notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 20 }, link: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
});
