import { StyleSheet, Text, View } from 'react-native';

import type { ProductCondition } from '@/features/products/types';
import { productConditionOptions } from '@/features/products/conditions';

const conditionStyles: Record<ProductCondition, { backgroundColor: string; color: string }> = {
  new: { backgroundColor: '#E5F3EA', color: '#286744' },
  'semi-new': { backgroundColor: '#FFF1D9', color: '#805B20' },
  'good-used': { backgroundColor: '#FCE7EC', color: '#944B5A' },
};

export function ProductConditionBadge({ condition, compact = false }: { condition: ProductCondition; compact?: boolean }) {
  const option = productConditionOptions.find((item) => item.value === condition) ?? productConditionOptions[2];
  const colors = conditionStyles[condition] ?? conditionStyles['good-used'];

  return (
    <View accessibilityLabel={`Estado da peça: ${option.label}`} style={[styles.badge, compact && styles.compact, { backgroundColor: colors.backgroundColor }]}>
      <Text numberOfLines={1} style={[styles.label, compact && styles.compactLabel, { color: colors.color }]}>{compact ? option.compactLabel : option.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', maxWidth: '100%', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  compact: { paddingHorizontal: 5, paddingVertical: 4 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  compactLabel: { fontSize: 8 },
});
