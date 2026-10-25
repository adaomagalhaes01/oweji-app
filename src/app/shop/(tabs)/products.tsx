import { Image } from 'expo-image';
import { CheckCircle2, CircleAlert, Package, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantHeader } from '@/components/merchant/merchant-header';
import { ProductForm, type ProductFormValues } from '@/components/merchant/product-form';
import { MerchantEmptyState } from '@/components/merchant/merchant-ui';
import { ProductConditionBadge } from '@/components/products/product-condition-badge';
import { Palette } from '@/constants/palette';
import { getMerchantProducts } from '@/features/merchant/metrics';
import { productCategoryOptions } from '@/features/merchant/product-options';
import { formatPrice } from '@/features/products/data';
import { getShopProductImage } from '@/features/products/shop-images';
import { useProfileStore } from '@/store/profile-store';
import { useShopStore, type ShopProduct } from '@/store/shop-store';

type Feedback = { type: 'success' | 'error'; message: string };

export default function MerchantProductsScreen() {
  const storeId = useProfileStore((state) => state.storeId);
  const products = useShopStore((state) => state.products);
  const addProduct = useShopStore((state) => state.addProduct);
  const updateProduct = useShopStore((state) => state.updateProduct);
  const removeProduct = useShopStore((state) => state.removeProduct);
  const [mode, setMode] = useState<'new' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const merchantProducts = useMemo(() => getMerchantProducts(products, storeId), [products, storeId]);
  const totalStock = merchantProducts.reduce((total, product) => total + product.stock, 0);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const openNew = () => {
    setEditingProduct(null);
    setMode('new');
    setFeedback(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const openEdit = (product: ShopProduct) => {
    setEditingProduct(product);
    setMode('edit');
    setFeedback(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const closeForm = () => {
    setMode(null);
    setEditingProduct(null);
  };

  const saveProduct = (values: ProductFormValues) => {
    if (!storeId || saving) return;
    setSaving(true);
    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, storeId, values);
        setFeedback({ type: 'success', message: 'Produto actualizado na loja e no catálogo.' });
      } else {
        addProduct({ ...values, merchantId: storeId });
        setFeedback({ type: 'success', message: values.stock > 0 ? 'Produto publicado e disponível no catálogo OWEJI.' : 'Produto publicado, mas marcado como esgotado enquanto não houver stock.' });
      }
      closeForm();
    } catch {
      setFeedback({ type: 'error', message: 'Não foi possível guardar o produto. Os dados foram mantidos; tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = (product: ShopProduct) => {
    Alert.alert(
      'Remover produto',
      `Quer remover “${product.name}” da sua loja? Os pedidos já registados serão preservados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            try {
              removeProduct(product.id, storeId);
              setFeedback({ type: 'success', message: 'Produto removido da loja e do catálogo.' });
            } catch {
              setFeedback({ type: 'error', message: 'Não foi possível remover o produto. Tente novamente.' });
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <MerchantHeader
          title="Produtos"
          kicker="CATÁLOGO DA LOJA"
          subtitle={`${merchantProducts.length} ${merchantProducts.length === 1 ? 'produto publicado' : 'produtos publicados'} · ${totalStock} ${totalStock === 1 ? 'unidade em stock' : 'unidades em stock'}`}
        />

        {feedback ? (
          <View style={[styles.feedback, feedback.type === 'error' && styles.feedbackError]}>
            {feedback.type === 'success' ? <CheckCircle2 size={17} color={Palette.success} /> : <CircleAlert size={17} color={Palette.error} />}
            <Text accessibilityRole="alert" style={[styles.feedbackText, feedback.type === 'error' && styles.feedbackTextError]}>{feedback.message}</Text>
          </View>
        ) : null}

        {!mode ? (
          <Pressable accessibilityRole="button" onPress={openNew} style={styles.addButton}>
            <View style={styles.addIcon}><Plus size={18} color={Palette.surface} /></View>
            <View style={styles.addCopy}>
              <Text style={styles.addTitle}>Adicionar novo produto</Text>
              <Text style={styles.addText}>Fotografia, preço, stock, tamanhos, cores e categoria.</Text>
            </View>
          </Pressable>
        ) : (
          <ProductForm
            key={editingProduct?.id ?? 'new'}
            initialProduct={editingProduct ?? undefined}
            submitting={saving}
            onSubmit={saveProduct}
            onCancel={closeForm}
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Na sua loja</Text>
          {!mode ? <Pressable accessibilityRole="button" accessibilityLabel="Adicionar produto" onPress={openNew} style={styles.smallAdd}><Plus size={17} color={Palette.surface} /></Pressable> : null}
        </View>

        {merchantProducts.length === 0 ? (
          <MerchantEmptyState
            icon={<Package size={20} color={Palette.primaryDark} />}
            title="A sua loja ainda não tem produtos"
            text="Publique a primeira peça para começar a vender no catálogo OWEJI."
            actionLabel="PUBLICAR PRIMEIRO PRODUTO"
            onAction={openNew}
          />
        ) : merchantProducts.map((product) => {
          const category = productCategoryOptions.find((option) => option.id === product.category)?.label ?? 'Sem categoria';
          return (
            <View key={product.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.imageWrap}>
                  <Image source={getShopProductImage(product)} style={styles.image} contentFit="cover" />
                  {product.stock === 0 ? <View style={styles.soldOut}><Text style={styles.soldOutText}>ESGOTADO</Text></View> : null}
                </View>
                <View style={styles.cardCopy}>
                  <View style={styles.nameRow}>
                    <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
                    <Text style={[styles.availability, product.stock === 0 && styles.availabilityEmpty]}>
                      {product.stock === 0 ? 'Indisponível' : `${product.stock} em stock`}
                    </Text>
                  </View>
                  <View style={styles.categoryLine}><Text style={styles.category}>{category}</Text><ProductConditionBadge condition={product.condition} compact /></View>
                  <Text numberOfLines={2} style={styles.description}>{product.description}</Text>
                  <Text style={styles.price}>{formatPrice(product.price)}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaGroup}>
                  <Text style={styles.metaLabel}>Tamanhos</Text>
                  <Text numberOfLines={1} style={styles.metaValue}>{product.sizes.join(' · ')}</Text>
                </View>
                <View style={styles.metaGroup}>
                  <Text style={styles.metaLabel}>Cores</Text>
                  <View style={styles.colorDots}>
                    {product.colors.slice(0, 5).map((color) => <View key={color} style={[styles.colorDot, { backgroundColor: color }, color === '#FFFFFF' && styles.whiteDot]} />)}
                    {product.colors.length > 5 ? <Text style={styles.moreColors}>+{product.colors.length - 5}</Text> : null}
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${product.name}`} onPress={() => openEdit(product)} style={styles.editButton}>
                  <Pencil size={14} color={Palette.primaryDark} />
                  <Text style={styles.editText}>Editar</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${product.name}`} onPress={() => confirmRemove(product)} style={styles.removeButton}>
                  <Trash2 size={14} color={Palette.error} />
                  <Text style={styles.removeText}>Remover</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <Text style={styles.footnote}>Produtos com stock zero continuam na loja mas aparecem como indisponíveis no catálogo. O histórico de pedidos não é alterado ao editar ou remover uma peça.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },
  feedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, marginTop: 12, borderRadius: 13, backgroundColor: '#E5F3EA' },
  feedbackError: { backgroundColor: Palette.softPink },
  feedbackText: { flex: 1, color: '#286744', fontFamily: 'Poppins_500Medium', fontSize: 9, lineHeight: 15 },
  feedbackTextError: { color: Palette.error },
  addButton: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, marginTop: 16, borderRadius: 16, backgroundColor: Palette.primary },
  addIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' },
  addCopy: { flex: 1 },
  addTitle: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 12 },
  addText: { color: Palette.surface, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 3, opacity: 0.9 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 11 },
  sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16 },
  smallAdd: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary },
  card: { padding: 11, marginBottom: 11, borderRadius: 16, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  cardTop: { flexDirection: 'row', gap: 11 },
  imageWrap: { width: 84, height: 106, borderRadius: 12, overflow: 'hidden', backgroundColor: Palette.softPink },
  image: { width: '100%', height: '100%' },
  soldOut: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(37,34,37,0.48)' },
  soldOutText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 0.5 },
  cardCopy: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  name: { flex: 1, color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  availability: { color: '#286744', fontFamily: 'Poppins_600SemiBold', fontSize: 7, marginTop: 2 },
  availabilityEmpty: { color: Palette.error },
  categoryLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 3 },
  category: { flex: 1, color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 8 },
  description: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, marginTop: 4 },
  price: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 12, marginTop: 5 },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Palette.border },
  metaGroup: { flex: 1, minWidth: 0 },
  metaLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8 },
  metaValue: { color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 9, marginTop: 3 },
  colorDots: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  colorDot: { width: 13, height: 13, borderRadius: 7, borderWidth: 1, borderColor: Palette.border },
  whiteDot: { borderColor: '#D8CCD0' },
  moreColors: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  editButton: { flex: 1, minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 11, backgroundColor: Palette.softPink },
  editText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  removeButton: { flex: 1, minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 11, backgroundColor: Palette.background },
  removeText: { color: Palette.error, fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  footnote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, marginTop: 6 },
});
