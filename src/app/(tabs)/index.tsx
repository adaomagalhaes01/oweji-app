import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Bell, Search, ShoppingBag, SlidersHorizontal, UserRound } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/cards/product-card';
import { ProductFilterSheet, type ProductPriceRange, type ProductSortOption } from '@/components/products/product-filter-sheet';
import { Palette } from '@/constants/palette';
import { categories } from '@/features/products/data';
import { getProductCatalog } from '@/features/products/catalog';
import type { Product } from '@/features/products/types';
import { useCartStore } from '@/store/cart-store';
import { useNotificationStore } from '@/store/notification-store';
import { useProfileStore } from '@/store/profile-store';
import { useShopStore } from '@/store/shop-store';

const horizontalPadding = 20;

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortOption, setSortOption] = useState<ProductSortOption>('featured');
  const [priceRange, setPriceRange] = useState<ProductPriceRange>('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const sellerProducts = useShopStore((state) => state.products);
  const catalog = useMemo(() => getProductCatalog(sellerProducts), [sellerProducts]);
  const cartCount = useCartStore((state) => state.items.reduce((count, item) => count + item.quantity, 0));
  const unreadCount = useNotificationStore((state) => state.notifications.filter((item) => !item.read).length);
  const userName = useProfileStore((state) => state.name);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-AO');
    const result = catalog.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${product.name} ${product.category}`.toLocaleLowerCase('pt-AO').includes(normalizedQuery);
      const matchesPrice = priceRange === 'all' || (priceRange === 'under-1000' && product.price < 1000) || (priceRange === '1000-2000' && product.price >= 1000 && product.price <= 2000) || (priceRange === 'over-2000' && product.price > 2000);
      return matchesCategory && matchesQuery && matchesPrice && (!availableOnly || product.available);
    });
    if (sortOption === 'price-asc') return result.sort((left, right) => left.price - right.price);
    if (sortOption === 'price-desc') return result.sort((left, right) => right.price - left.price);
    if (sortOption === 'rating') return result.sort((left, right) => right.rating - left.rating);
    return result;
  }, [activeCategory, availableOnly, catalog, priceRange, query, sortOption]);

  const renderProduct = ({ item }: { item: Product }) => <ProductCard product={item} />;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.headerSide}>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir notificações" onPress={() => router.push('/notifications')} style={styles.headerIcon}>
            <Bell size={19} color={Palette.text} />
            {unreadCount > 0 ? <View style={styles.notificationDot} /> : null}
          </Pressable>
        </View>
        <View style={styles.brand}><Text style={styles.wordmark}>OWEJI</Text><Text style={styles.eyebrow}>MARKETPLACE DE MODA</Text></View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir carrinho" onPress={() => router.push('/cart')} style={styles.headerIcon}>
            <ShoppingBag size={19} color={Palette.text} />
            {cartCount > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text></View> : null}
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => router.push('/profile')} style={styles.headerIcon}>
            <UserRound size={19} color={Palette.primaryDark} />
          </Pressable>
        </View>
      </View>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.intro}>
              <Text style={styles.greeting}>Olá, {userName.split(' ')[0]}</Text>
              <Text style={styles.headline}>Combine o seu estilo.</Text>
              <Text style={styles.subtitle}>Peças escolhidas para se sentir bem, todos os dias.</Text>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Search size={19} color={Palette.textSecondary} />
                <TextInput
                  accessibilityLabel="Pesquisar produtos"
                  placeholder="Pesquisar roupas, acessórios..."
                  placeholderTextColor={Palette.textSecondary}
                  value={query}
                  onChangeText={setQuery}
                  returnKeyType="search"
                  style={styles.searchInput}
                />
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Filtrar e ordenar produtos" onPress={() => setFiltersVisible(true)} style={styles.filterButton}>
                <SlidersHorizontal size={19} color={Palette.text} />
                {(sortOption !== 'featured' || availableOnly || priceRange !== 'all') ? <View style={styles.filterDot} /> : null}
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}>
              {categories.map((category) => {
                const active = activeCategory === category.id;
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

            <View style={styles.editorialCard}>
              <Image
                source={require('@/assets/products/editorial.jpg')}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                accessibilityLabel="Editorial de moda Oweji"
              />
              <View style={styles.editorialShade} />
              <View style={styles.editorialCopy}>
                <Text style={styles.editorialKicker}>NOVA COLEÇÃO</Text>
                <Text style={styles.editorialTitle}>Vista-se{ '\n' }de si.</Text>
                <Text style={styles.editorialSubtitle}>Descubra peças com personalidade.</Text>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>{query || activeCategory !== 'all' ? 'A sua seleção' : 'Em alta agora'}</Text>
                <Text style={styles.sectionSubtitle}>Peças que merecem um lugar no seu armário</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setActiveCategory('all')}>
                <Text style={styles.seeAll}>Ver tudo</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Não encontrámos essa peça</Text>
            <Text style={styles.emptyMessage}>Experimente outro termo ou escolha uma categoria.</Text>
          </View>
        }
      />
      <ProductFilterSheet visible={filtersVisible} sortOption={sortOption} availableOnly={availableOnly} priceRange={priceRange} onSortChange={setSortOption} onAvailabilityChange={setAvailableOnly} onPriceRangeChange={setPriceRange} onClear={() => { setSortOption('featured'); setAvailableOnly(false); setPriceRange('all'); }} onClose={() => setFiltersVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  listContent: { paddingBottom: 28 },
  topBar: { height: 63, paddingHorizontal: horizontalPadding, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Palette.background, zIndex: 1 },
  brand: { flex: 1, alignItems: 'center' },
  headerSide: { width: 88, flexDirection: 'row', justifyContent: 'flex-start' },
  actions: { width: 88, flexDirection: 'row', justifyContent: 'flex-end', gap: 5 },
  wordmark: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 21, letterSpacing: 3 },
  eyebrow: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 8, letterSpacing: 1.4, marginTop: 1 },
  headerIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Palette.surface },
  notificationDot: { position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.primary, borderWidth: 1, borderColor: Palette.surface },
  cartBadge: { position: 'absolute', top: 1, right: 0, minWidth: 15, height: 15, paddingHorizontal: 3, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary },
  cartBadgeText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 8, lineHeight: 11 },
  intro: { paddingHorizontal: horizontalPadding, marginTop: 26 },
  greeting: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 13 },
  headline: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 25, marginTop: 5, letterSpacing: -0.5 },
  subtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 6 },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: horizontalPadding, marginTop: 21 },
  searchBox: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, backgroundColor: Palette.surface, borderRadius: 15, borderWidth: 1, borderColor: Palette.border },
  searchInput: { flex: 1, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 12, paddingVertical: 0 },
  filterButton: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.surface, borderRadius: 15, borderWidth: 1, borderColor: Palette.border },
  filterDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, top: 8, right: 8, backgroundColor: Palette.primary },
  categoryList: { gap: 9, paddingHorizontal: horizontalPadding, paddingTop: 17, paddingBottom: 19 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  categoryChipActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  categoryText: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  categoryTextActive: { color: Palette.surface },
  editorialCard: { height: 172, marginHorizontal: horizontalPadding, overflow: 'hidden', borderRadius: 20, justifyContent: 'center', backgroundColor: Palette.softPink },
  editorialShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(54, 25, 36, 0.23)' },
  editorialCopy: { marginLeft: 20 },
  editorialKicker: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 1.8 },
  editorialTitle: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 27, lineHeight: 31, marginTop: 6 },
  editorialSubtitle: { color: Palette.surface, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 5 },
  sectionHeading: { marginHorizontal: horizontalPadding, marginTop: 26, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 18 },
  sectionSubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 4 },
  seeAll: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  productRow: { gap: 13, paddingHorizontal: horizontalPadding, marginBottom: 20 },
  emptyState: { marginHorizontal: horizontalPadding, marginTop: 28, padding: 22, alignItems: 'center', borderRadius: 18, backgroundColor: Palette.surface },
  emptyTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 15 },
  emptyMessage: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', textAlign: 'center', fontSize: 12, marginTop: 7 },
});
