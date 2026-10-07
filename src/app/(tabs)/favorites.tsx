import { Heart } from 'lucide-react-native';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/cards/product-card';
import { Palette } from '@/constants/palette';
import { getProductCatalog } from '@/features/products/catalog';
import type { Product } from '@/features/products/types';
import { useFavoritesStore } from '@/store/favorites-store';
import { useShopStore } from '@/store/shop-store';

export default function FavoritesScreen() {
  const favoriteIds = useFavoritesStore((state) => state.productIds);
  const sellerProducts = useShopStore((state) => state.products);
  const favorites = getProductCatalog(sellerProducts).filter((product) => favoriteIds.includes(product.id));

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Product }) => <ProductCard product={item} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={styles.heading}><Text style={styles.kicker}>A SUA SELEÇÃO</Text><Text style={styles.title}>Favoritos</Text><Text style={styles.subtitle}>Guarde aqui as peças que conquistaram você.</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><Heart size={28} color={Palette.primary} /><Text style={styles.emptyTitle}>Ainda sem favoritos</Text><Text style={styles.emptyText}>Toque no coração de uma peça para encontrá-la aqui.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  content: { paddingBottom: 28 },
  heading: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22 },
  kicker: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 1.7 },
  title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 27, marginTop: 5 },
  subtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 6 },
  row: { gap: 13, paddingHorizontal: 20, marginBottom: 20 },
  empty: { marginHorizontal: 20, marginTop: 30, padding: 28, alignItems: 'center', borderRadius: 20, backgroundColor: Palette.surface },
  emptyTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16, marginTop: 12 },
  emptyText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', textAlign: 'center', fontSize: 12, marginTop: 6 },
});
