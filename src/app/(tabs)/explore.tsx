import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SlidersHorizontal } from 'lucide-react-native';

import { ProductCard } from '@/components/cards/product-card';
import { ProductFilterSheet, type ProductPriceRange, type ProductSortOption } from '@/components/products/product-filter-sheet';
import { Palette } from '@/constants/palette';
import { categories } from '@/features/products/data';
import { getProductCatalog } from '@/features/products/catalog';
import type { Product } from '@/features/products/types';
import { useShopStore } from '@/store/shop-store';

export default function CategoriesScreen() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortOption, setSortOption] = useState<ProductSortOption>('featured');
  const [priceRange, setPriceRange] = useState<ProductPriceRange>('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const sellerProducts = useShopStore((state) => state.products);
  const catalog = useMemo(() => getProductCatalog(sellerProducts), [sellerProducts]);
  const activeLabel = categories.find((category) => category.id === activeCategory)?.label ?? 'Tudo';
  const categoryProducts = useMemo(() => {
    const result = catalog.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesPrice = priceRange === 'all' || (priceRange === 'under-1000' && product.price < 1000) || (priceRange === '1000-2000' && product.price >= 1000 && product.price <= 2000) || (priceRange === 'over-2000' && product.price > 2000);
      return matchesCategory && matchesPrice && (!availableOnly || product.available);
    });
    if (sortOption === 'price-asc') return result.sort((left, right) => left.price - right.price);
    if (sortOption === 'price-desc') return result.sort((left, right) => right.price - left.price);
    if (sortOption === 'rating') return result.sort((left, right) => right.rating - left.rating);
    return result;
  }, [activeCategory, availableOnly, catalog, priceRange, sortOption]);

  const renderProduct = ({ item }: { item: Product }) => <ProductCard product={item} />;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={categoryProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={styles.kicker}>EXPLORE A COLEÇÃO</Text>
            <Text style={styles.title}>Categorias</Text>
            <Text style={styles.subtitle}>Encontre a peça certa para cada momento.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
              {categories.map((category) => {
                const active = category.id === activeCategory;
                return (
                  <Pressable
                    key={category.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setActiveCategory(category.id)}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}>
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{activeLabel}</Text>
              <View style={styles.resultActions}><Text style={styles.resultCount}>{categoryProducts.length} peças</Text><Pressable accessibilityRole="button" accessibilityLabel="Filtrar e ordenar produtos" onPress={() => setFiltersVisible(true)} style={styles.filterButton}><SlidersHorizontal size={16} color={Palette.primaryDark} />{(sortOption !== 'featured' || availableOnly || priceRange !== 'all') ? <View style={styles.filterDot} /> : null}<Text style={styles.filterLabel}>Filtrar</Text></Pressable></View>
            </View>
          </View>
        }
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>Nenhuma peça nesta seleção</Text><Text style={styles.emptySubtitle}>Experimente outra categoria ou altere os filtros.</Text></View>}
      />
      <ProductFilterSheet visible={filtersVisible} sortOption={sortOption} availableOnly={availableOnly} priceRange={priceRange} onSortChange={setSortOption} onAvailabilityChange={setAvailableOnly} onPriceRangeChange={setPriceRange} onClear={() => { setSortOption('featured'); setAvailableOnly(false); setPriceRange('all'); }} onClose={() => setFiltersVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  content: { paddingTop: 18, paddingBottom: 28 },
  kicker: { marginHorizontal: 20, color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 1.7 },
  title: { marginHorizontal: 20, color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 27, marginTop: 5 },
  subtitle: { marginHorizontal: 20, color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 6 },
  categoryList: { gap: 9, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 21 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  categoryChipActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  categoryText: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  categoryTextActive: { color: Palette.surface },
  resultHeader: { marginHorizontal: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 17 },
  resultCount: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11 },
  filterButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, borderRadius: 12, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  filterLabel: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  filterDot: { position: 'absolute', top: 3, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.primary },
  productRow: { gap: 13, paddingHorizontal: 20, marginBottom: 20 },
  empty: { marginHorizontal: 20, padding: 22, alignItems: 'center', borderRadius: 16, backgroundColor: Palette.surface },
  emptyTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 13 },
  emptySubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, textAlign: 'center', marginTop: 5 },
});
