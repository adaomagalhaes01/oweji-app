import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/palette';
import { formatPrice } from '@/features/products/data';
import type { Product } from '@/features/products/types';
import { useFavoritesStore } from '@/store/favorites-store';

type ProductCardProps = {
  product: Product;
};

function ProductCardComponent({ product }: ProductCardProps) {
  const isFavorite = useFavoritesStore((state) => state.productIds.includes(product.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${product.name}`} onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} style={styles.imagePressable}>
          <Image source={product.image} style={styles.image} contentFit="cover" transition={180} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? `Remover ${product.name} dos favoritos` : `Adicionar ${product.name} aos favoritos`}
          accessibilityState={{ selected: isFavorite }}
          hitSlop={8}
          onPress={() => toggleFavorite(product.id)}
          style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}>
          <Heart size={19} color={isFavorite ? Palette.primaryDark : Palette.textSecondary} fill={isFavorite ? Palette.primary : 'transparent'} />
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} style={styles.details}>
        <View style={styles.nameRow}>
          <View style={[styles.availabilityDot, !product.available && styles.unavailable]} />
          <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
        </View>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
      </Pressable>
    </View>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0 },
  imageWrap: { aspectRatio: 0.78, overflow: 'hidden', borderRadius: 18, backgroundColor: Palette.softPink },
  image: { width: '100%', height: '100%' },
  imagePressable: { width: '100%', height: '100%' },
  favoriteButton: { position: 'absolute', top: 10, right: 10, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.94)' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  details: { paddingTop: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flex: 1, color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 13 },
  price: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 14, marginTop: 4 },
  availabilityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.success },
  unavailable: { backgroundColor: Palette.error },
});
