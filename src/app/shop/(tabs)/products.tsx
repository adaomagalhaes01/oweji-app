import { Image } from 'expo-image';
import { CheckCircle2, ChevronRight, CircleAlert, Package, Pencil, Plus, Trash2, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const storeName = useProfileStore((state) => state.storeName);
  const products = useShopStore((state) => state.products);
  const addProduct = useShopStore((state) => state.addProduct);
  const updateProduct = useShopStore((state) => state.updateProduct);
  const removeProduct = useShopStore((state) => state.removeProduct);
  const [mode, setMode] = useState<'new' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<ShopProduct | null>(null);
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
    if (saving) return;
    if (!storeId) {
      setFeedback({ type: 'error', message: 'A loja ainda está a carregar. Aguarde um momento e tente publicar novamente.' });
      return;
    }
    setSaving(true);
    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, storeId, { ...values, merchantStoreName: storeName });
        setFeedback({ type: 'success', message: 'Produto actualizado na loja e no catálogo.' });
      } else {
        addProduct({ ...values, merchantId: storeId, merchantStoreName: storeName });
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
    <>
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
        ) : <View style={styles.grid}>{merchantProducts.map((product) => {
          const category = productCategoryOptions.find((option) => option.id === product.category)?.label ?? 'Sem categoria';
          return (
            <Pressable key={product.id} accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${product.name}`} onPress={() => setViewingProduct(product)} style={styles.card}>
              <View style={styles.productHeader}>
                <View style={styles.productHeading}>
                  <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
                  <Text style={styles.category}>{category}</Text>
                </View>
                <ProductConditionBadge condition={product.condition} compact />
              </View>
              <View style={styles.productInfo}>
                <View style={styles.imageWrap}>
                  {getShopProductImage(product) ? <Image source={getShopProductImage(product)} style={styles.image} contentFit="cover" /> : <View style={styles.noPhoto}><Package size={19} color={Palette.primaryDark} /></View>}
                  {product.stock === 0 ? <View style={styles.soldOut}><Text style={styles.soldOutText}>ESGOTADO</Text></View> : null}
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.price}>{formatPrice(product.price)}</Text>
                  <Text style={[styles.availability, product.stock === 0 && styles.availabilityEmpty]}>{product.stock === 0 ? 'Indisponível' : `${product.stock} em stock`}</Text>
                  <Text numberOfLines={1} style={styles.metaValue}>{product.sizes.join(' · ')}{product.colors.length ? ` · ${product.colors.join(', ')}` : ''}</Text>
                </View>
                <ChevronRight size={17} color={Palette.primaryDark} />
              </View>
              <View style={styles.actions}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${product.name}`} onPress={(event) => { event.stopPropagation(); openEdit(product); }} style={styles.editButton}>
                  <Pencil size={14} color={Palette.primaryDark} /><Text style={styles.editText}>Editar</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${product.name}`} onPress={(event) => { event.stopPropagation(); confirmRemove(product); }} style={styles.removeButton}>
                  <Trash2 size={14} color={Palette.error} /><Text style={styles.removeText}>Remover</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}</View>}

        <Text style={styles.footnote}>Produtos com stock zero continuam na loja mas aparecem como indisponíveis no catálogo. O histórico de pedidos não é alterado ao editar ou remover uma peça.</Text>
      </ScrollView>
    </SafeAreaView>
    <Modal visible={Boolean(viewingProduct)} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setViewingProduct(null)}>
      {viewingProduct ? <SafeAreaView style={styles.detailScreen}>
        <View style={styles.detailHeader}><Text style={styles.detailHeaderTitle}>Detalhes do produto</Text><Pressable accessibilityRole="button" accessibilityLabel="Fechar detalhes" onPress={() => setViewingProduct(null)} style={styles.detailClose}><X size={20} color={Palette.text} /></Pressable></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
          <View style={styles.detailImageWrap}>{getShopProductImage(viewingProduct) ? <Image source={getShopProductImage(viewingProduct)} style={styles.detailImage} contentFit="contain" /> : <View style={styles.noPhoto}><Package size={34} color={Palette.primaryDark} /><Text style={styles.noPhotoText}>Sem fotografia</Text></View>}</View>
          <Text style={styles.detailCategory}>{productCategoryOptions.find((option) => option.id === viewingProduct.category)?.label ?? 'Sem categoria'}</Text>
          <Text style={styles.detailName}>{viewingProduct.name}</Text>
          <Text style={styles.detailPrice}>{formatPrice(viewingProduct.price)}</Text>
          <View style={styles.detailStock}><Text style={styles.detailLabel}>Disponibilidade</Text><Text style={[styles.detailValue, viewingProduct.stock === 0 && styles.detailUnavailable]}>{viewingProduct.stock === 0 ? 'Esgotado' : `${viewingProduct.stock} unidades em stock`}</Text></View>
          <Text style={styles.detailLabel}>Descrição</Text><Text style={styles.detailDescription}>{viewingProduct.description}</Text>
          <Text style={styles.detailLabel}>Tamanhos</Text><Text style={styles.detailValue}>{viewingProduct.sizes.join(' · ')}</Text>
          <Text style={styles.detailLabel}>Cores</Text><Text style={styles.detailValue}>{viewingProduct.colors.join(' · ') || 'Sem cor indicada'}</Text>
          <View style={styles.detailCondition}><ProductConditionBadge condition={viewingProduct.condition} /></View>
          <Pressable accessibilityRole="button" onPress={() => { const product = viewingProduct; setViewingProduct(null); openEdit(product); }} style={styles.detailEdit}><Pencil size={16} color={Palette.surface} /><Text style={styles.detailEditText}>EDITAR PRODUTO</Text></Pressable>
        </ScrollView>
      </SafeAreaView> : null}
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },
  feedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, marginTop: 12, borderRadius: 13, backgroundColor: '#E5F3EA' },
  feedbackError: { backgroundColor: Palette.softPink },
  feedbackText: { flex: 1, color: '#286744', fontFamily: 'Poppins_500Medium', fontSize: 11, lineHeight: 15 },
  feedbackTextError: { color: Palette.error },
  addButton: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, marginTop: 16, borderRadius: 16, backgroundColor: Palette.primary },
  addIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' },
  addCopy: { flex: 1 },
  addTitle: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 13 },
  addText: { color: Palette.surface, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 3, opacity: 0.9 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 11 },
  sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16 },
  smallAdd: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary },
  grid: { gap: 0 },
  card: { width: '100%', padding: 13, marginBottom: 11, borderRadius: 17, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  productHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  productHeading: { flex: 1 },
  productInfo: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 10, marginTop: 10, borderTopWidth: 1, borderTopColor: Palette.border },
  imageWrap: { width: 54, height: 62, borderRadius: 10, overflow: 'hidden', backgroundColor: Palette.softPink },
  image: { width: '100%', height: '100%' },
  soldOut: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(37,34,37,0.48)' },
  soldOutText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 0.5 },
  noPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  noPhotoText: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 11 },
  cardCopy: { flex: 1, minWidth: 0, justifyContent: 'center' },
  name: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 13, lineHeight: 18 },
  availability: { color: '#286744', fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginTop: 3 },
  availabilityEmpty: { color: Palette.error },
  category: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 2 },
  price: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 13, marginTop: 5 },
  metaValue: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 10, lineHeight: 14, marginTop: 5 },
  colorDots: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  colorDot: { width: 13, height: 13, borderRadius: 7, borderWidth: 1, borderColor: Palette.border },
  whiteDot: { borderColor: '#D8CCD0' },
  moreColors: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  editButton: { flex: 1, minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 10, backgroundColor: Palette.softPink },
  editText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  removeButton: { flex: 1, minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 10, backgroundColor: Palette.background },
  removeText: { color: Palette.error, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  footnote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, lineHeight: 14, marginTop: 6 },
  detailScreen: { flex: 1, backgroundColor: Palette.background },
  detailHeader: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: Palette.border },
  detailHeaderTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16 },
  detailClose: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Palette.surface },
  detailContent: { paddingHorizontal: 20, paddingBottom: 32 },
  detailImageWrap: { width: '100%', height: 390, marginTop: 12, borderRadius: 20, overflow: 'hidden', backgroundColor: Palette.softPink },
  detailImage: { width: '100%', height: '100%' },
  detailCategory: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 11, letterSpacing: 1, marginTop: 20 },
  detailName: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 23, lineHeight: 30, marginTop: 4 },
  detailPrice: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 20, marginTop: 7 },
  detailStock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, marginTop: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Palette.border },
  detailLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 12, marginTop: 13 },
  detailValue: { color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 13, lineHeight: 19, marginTop: 4 },
  detailUnavailable: { color: Palette.error },
  detailDescription: { color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 21, marginTop: 4 },
  detailCondition: { alignSelf: 'flex-start', marginTop: 16 },
  detailEdit: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 22, borderRadius: 15, backgroundColor: Palette.primary },
  detailEditText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 0.4 },
});
