import { Check, SlidersHorizontal, X } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Palette } from '@/constants/palette';

export type ProductSortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';
export type ProductPriceRange = 'all' | 'under-1000' | '1000-2000' | 'over-2000';

type ProductFilterSheetProps = {
  visible: boolean;
  sortOption: ProductSortOption;
  availableOnly: boolean;
  priceRange: ProductPriceRange;
  onSortChange: (option: ProductSortOption) => void;
  onAvailabilityChange: (value: boolean) => void;
  onPriceRangeChange: (range: ProductPriceRange) => void;
  onClear: () => void;
  onClose: () => void;
};

const sortOptions: { id: ProductSortOption; label: string }[] = [
  { id: 'featured', label: 'Recomendados' },
  { id: 'price-asc', label: 'Menor preço' },
  { id: 'price-desc', label: 'Maior preço' },
  { id: 'rating', label: 'Melhor avaliados' },
];

const priceOptions: { id: ProductPriceRange; label: string }[] = [
  { id: 'all', label: 'Qualquer preço' },
  { id: 'under-1000', label: 'Até Kz 999' },
  { id: '1000-2000', label: 'Kz 1.000–2.000' },
  { id: 'over-2000', label: 'Acima de Kz 2.000' },
];

export function ProductFilterSheet({ visible, sortOption, availableOnly, priceRange, onSortChange, onAvailabilityChange, onPriceRangeChange, onClear, onClose }: ProductFilterSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.modalRoot}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar filtros" onPress={onClose} style={styles.scrim} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}><View style={styles.heading}><SlidersHorizontal size={18} color={Palette.primaryDark} /><Text style={styles.title}>Filtrar produtos</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fechar filtros" onPress={onClose} style={styles.close}><X size={18} color={Palette.text} /></Pressable></View>
          <Text style={styles.sectionTitle}>Ordenar por</Text>
          <View style={styles.options}>{sortOptions.map((option) => {
            const selected = sortOption === option.id;
            return <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onSortChange(option.id)} style={[styles.option, selected && styles.optionSelected]}><Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>{selected ? <Check size={16} color={Palette.primaryDark} /> : null}</Pressable>;
          })}</View>
          <Text style={styles.priceHeading}>Faixa de preço</Text>
          <View style={styles.options}>{priceOptions.map((option) => {
            const selected = priceRange === option.id;
            return <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onPriceRangeChange(option.id)} style={[styles.option, selected && styles.optionSelected]}><Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>{selected ? <Check size={16} color={Palette.primaryDark} /> : null}</Pressable>;
          })}</View>
          <View style={styles.availabilityRow}><View style={styles.availabilityCopy}><Text style={styles.sectionTitle}>Disponibilidade</Text><Text style={styles.hint}>Mostrar apenas peças disponíveis</Text></View><Switch value={availableOnly} onValueChange={onAvailabilityChange} trackColor={{ false: Palette.border, true: Palette.primary }} thumbColor={Palette.surface} accessibilityLabel="Mostrar apenas produtos disponíveis" /></View>
          <View style={styles.actions}><Pressable accessibilityRole="button" onPress={onClear} style={styles.clearButton}><Text style={styles.clearText}>LIMPAR</Text></Pressable><Pressable accessibilityRole="button" onPress={onClose} style={styles.applyButton}><Text style={styles.applyText}>MOSTRAR PRODUTOS</Text></Pressable></View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(30,20,25,0.32)' }, scrim: { ...StyleSheet.absoluteFill }, sheet: { paddingHorizontal: 22, paddingTop: 9, paddingBottom: 27, borderTopLeftRadius: 25, borderTopRightRadius: 25, backgroundColor: Palette.background }, handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: Palette.border, marginBottom: 17 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }, heading: { flexDirection: 'row', alignItems: 'center', gap: 9 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 17 }, close: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Palette.surface }, sectionTitle: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12 }, priceHeading: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12, marginTop: 19 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 11 }, option: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 13, borderRadius: 13, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }, optionSelected: { backgroundColor: Palette.softPink, borderColor: Palette.primary }, optionText: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 10 }, optionTextSelected: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold' }, availabilityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingVertical: 13, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Palette.border }, availabilityCopy: { gap: 3 }, hint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10 }, actions: { flexDirection: 'row', gap: 10, marginTop: 19 }, clearButton: { minHeight: 49, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Palette.surface }, clearText: { color: Palette.textSecondary, fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 0.4 }, applyButton: { flex: 1, minHeight: 49, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Palette.primary }, applyText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 0.4 },
});
