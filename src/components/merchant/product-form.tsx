import { Image } from 'expo-image';
import { ImagePlus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Palette } from '@/constants/palette';
import { productCategoryOptions, productColorOptions, productSizeOptions } from '@/features/merchant/product-options';
import { pickImageFromLibrary } from '@/features/media/pick-image';
import { productConditionOptions } from '@/features/products/conditions';
import { shopImages } from '@/features/products/shop-images';
import type { ProductCondition } from '@/features/products/types';
import type { ShopImageKey, ShopProduct } from '@/store/shop-store';

export type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  imageKey: ShopImageKey;
  imageUri: string | null;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  condition: ProductCondition;
};

type ProductFormProps = {
  initialProduct?: ShopProduct;
  submitting: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
};

export function ProductForm({ initialProduct, submitting, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initialProduct?.name ?? '');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '');
  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : '1');
  const [imageKey, setImageKey] = useState<ShopImageKey>(initialProduct?.imageKey ?? 'pink');
  const [imageUri, setImageUri] = useState<string | null>(initialProduct?.imageUri ?? null);
  const [category, setCategory] = useState(initialProduct?.category ?? productCategoryOptions[0].id);
  const [sizes, setSizes] = useState<string[]>(initialProduct?.sizes ?? ['Único']);
  const [colors, setColors] = useState<string[]>(initialProduct?.colors ?? [productColorOptions[0].value]);
  const [condition, setCondition] = useState<ProductCondition | null>(initialProduct?.condition ?? null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState('');

  const priceValue = Number(price.replace(',', '.'));
  const stockValue = Number(stock.replace(',', '.'));
  const validPrice = Number.isFinite(priceValue) && priceValue > 0;
  const validStock = Number.isInteger(stockValue) && stockValue >= 0;
  const canSubmit = name.trim().length > 2
    && description.trim().length > 5
    && validPrice
    && validStock
    && sizes.length > 0
    && colors.length > 0
    && condition !== null;

  const preview = imageUri ? { uri: imageUri } : shopImages[imageKey];

  const toggleSize = (size: string) => {
    setError('');
    setSizes((current) => current.includes(size) ? current.filter((item) => item !== size) : [...current, size]);
  };

  const toggleColor = (color: string) => {
    setError('');
    setColors((current) => current.includes(color) ? current.filter((item) => item !== color) : [...current, color]);
  };

  const pickPhoto = async () => {
    if (picking) return;
    setPicking(true);
    setError('');
    try {
      const uri = await pickImageFromLibrary({ prefix: 'produto' });
      if (uri) setImageUri(uri);
    } catch {
      Alert.alert('Não foi possível abrir a galeria', 'Verifique a permissão de acesso às fotografias e tente novamente.');
    } finally {
      setPicking(false);
    }
  };

  const submit = () => {
    if (!canSubmit || !condition) {
      setError('Preencha o nome, a descrição, o preço, o stock, a categoria, o tamanho, a cor e o estado da peça.');
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: priceValue,
      imageKey,
      imageUri,
      category,
      sizes,
      colors,
      stock: stockValue,
      condition,
    });
  };

  return (
    <View style={styles.form}>
      <View style={styles.formHeader}>
        <View style={styles.formHeaderCopy}>
          <Text style={styles.formTitle}>{initialProduct ? 'Editar produto' : 'Publicar produto'}</Text>
          <Text style={styles.formSubtitle}>{initialProduct ? 'Actualize os dados da peça na loja e no catálogo.' : 'Adicione todos os detalhes que o cliente vai ver.'}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar formulário" onPress={onCancel} hitSlop={8} style={styles.closeButton}>
          <X size={16} color={Palette.textSecondary} />
        </Pressable>
      </View>

      <Text style={styles.fieldLabel}>Fotografia do produto</Text>
      <View style={styles.photoRow}>
        <Image source={preview} style={styles.photoPreview} contentFit="cover" />
        <View style={styles.photoActions}>
          <Pressable accessibilityRole="button" disabled={picking} onPress={pickPhoto} style={[styles.photoButton, picking && styles.disabled]}>
            <ImagePlus size={16} color={Palette.primaryDark} />
            <Text style={styles.photoButtonText}>{picking ? 'A ABRIR…' : 'ESCOLHER DA GALERIA'}</Text>
          </Pressable>
          {imageUri ? (
            <Pressable accessibilityRole="button" onPress={() => setImageUri(null)} style={styles.removePhoto}>
              <Text style={styles.removePhotoText}>Usar imagem predefinida</Text>
            </Pressable>
          ) : (
            <Text style={styles.photoHint}>JPG, PNG ou WebP · enquadramento 4:5</Text>
          )}
        </View>
      </View>
      <Text style={styles.fieldLabel}>Ou escolha uma imagem predefinida</Text>
      <View style={styles.imageChoices}>
        {(Object.keys(shopImages) as ShopImageKey[]).map((key) => {
          const selected = !imageUri && imageKey === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar fotografia predefinida ${key}`}
              accessibilityState={{ selected }}
              onPress={() => { setImageKey(key); setImageUri(null); }}
              style={[styles.imageChoice, selected && styles.imageChoiceSelected]}>
              <Image source={shopImages[key]} style={styles.presetPreview} contentFit="cover" />
            </Pressable>
          );
        })}
      </View>

      <ShopField label="Nome do produto" value={name} onChangeText={(value) => { setError(''); setName(value); }} placeholder="Ex.: Blusa de linho" />
      <ShopField label="Descrição" value={description} onChangeText={(value) => { setError(''); setDescription(value); }} placeholder="Descreva o tecido, o corte e o estado da peça" multiline />
      <View style={styles.twoColumns}>
        <View style={styles.column}><ShopField label="Preço (Kz)" value={price} onChangeText={(value) => { setError(''); setPrice(value); }} placeholder="Ex.: 12500" keyboardType="decimal-pad" /></View>
        <View style={styles.column}><ShopField label="Stock" value={stock} onChangeText={(value) => { setError(''); setStock(value); }} placeholder="Ex.: 3" keyboardType="number-pad" /></View>
      </View>
      {price.length > 0 && !validPrice ? <Text style={styles.fieldError}>Indique um preço superior a zero.</Text> : null}
      {stock.length > 0 && !validStock ? <Text style={styles.fieldError}>Use um número inteiro igual ou superior a zero.</Text> : null}

      <Text style={styles.fieldLabel}>Categoria</Text>
      <View style={styles.chipWrap}>
        {productCategoryOptions.map((option) => {
          const selected = category === option.id;
          return (
            <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setCategory(option.id)} style={[styles.chip, selected && styles.chipSelected]}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>Tamanhos disponíveis</Text>
      <View style={styles.chipWrap}>
        {productSizeOptions.map((size) => {
          const selected = sizes.includes(size);
          return (
            <Pressable key={size} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => toggleSize(size)} style={[styles.sizeChip, selected && styles.chipSelected]}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{size}</Text>
            </Pressable>
          );
        })}
      </View>
      {sizes.length === 0 ? <Text style={styles.fieldError}>Seleccione pelo menos um tamanho.</Text> : null}

      <Text style={styles.fieldLabel}>Cores disponíveis</Text>
      <View style={styles.colorWrap}>
        {productColorOptions.map((option) => {
          const selected = colors.includes(option.value);
          return (
            <Pressable key={option.value} accessibilityRole="button" accessibilityLabel={`Cor ${option.label}`} accessibilityState={{ selected }} onPress={() => toggleColor(option.value)} style={styles.colorOption}>
              <View style={[styles.colorOuter, selected && styles.colorOuterSelected]}>
                <View style={[styles.colorDot, { backgroundColor: option.value }, option.value === '#FFFFFF' && styles.whiteColor]} />
              </View>
              <Text style={[styles.colorLabel, selected && styles.colorLabelSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {colors.length === 0 ? <Text style={styles.fieldError}>Seleccione pelo menos uma cor.</Text> : null}

      <Text style={styles.fieldLabel}>Estado da peça</Text>
      <View style={styles.chipWrap}>
        {productConditionOptions.map((option) => {
          const selected = condition === option.value;
          return (
            <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => { setError(''); setCondition(option.value); }} style={[styles.chip, selected && styles.chipSelected]}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text accessibilityRole="alert" style={styles.formError}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit || submitting, busy: submitting }}
        disabled={!canSubmit || submitting}
        onPress={submit}
        style={[styles.publishButton, (!canSubmit || submitting) && styles.disabled]}>
        <Text style={styles.publishText}>{submitting ? 'A GUARDAR…' : initialProduct ? 'GUARDAR ALTERAÇÕES' : 'PUBLICAR PRODUTO'}</Text>
      </Pressable>
      {!canSubmit ? <Text style={styles.formHint}>O produto só fica visível no catálogo depois de todos os campos estarem preenchidos.</Text> : null}
    </View>
  );
}

function ShopField({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'default' | 'decimal-pad' | 'number-pad' }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Palette.textSecondary}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: 15, borderRadius: 18, marginBottom: 13, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  formHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  formHeaderCopy: { flex: 1 },
  formTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 15 },
  formSubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, marginTop: 3 },
  closeButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Palette.background },
  field: { marginTop: 9 },
  fieldLabel: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginBottom: 5, marginTop: 11 },
  fieldError: { color: Palette.error, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 4 },
  formError: { color: Palette.error, fontFamily: 'Poppins_500Medium', fontSize: 9, lineHeight: 15, marginTop: 11 },
  input: { minHeight: 43, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Palette.background, borderWidth: 1, borderColor: Palette.border, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 11 },
  multiline: { minHeight: 69, paddingTop: 10, textAlignVertical: 'top' },
  twoColumns: { flexDirection: 'row', gap: 9 },
  column: { flex: 1, minWidth: 0 },
  photoRow: { flexDirection: 'row', gap: 12 },
  photoPreview: { width: 82, height: 102, borderRadius: 13, backgroundColor: Palette.softPink },
  photoActions: { flex: 1, justifyContent: 'center' },
  photoButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: Palette.primary, backgroundColor: '#FFF8FA' },
  photoButtonText: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 0.3 },
  photoHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 6 },
  removePhoto: { alignSelf: 'flex-start', paddingVertical: 4, marginTop: 4 },
  removePhotoText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  imageChoices: { flexDirection: 'row', gap: 9, marginTop: 3 },
  imageChoice: { width: 50, height: 59, padding: 3, borderRadius: 11, borderWidth: 1, borderColor: Palette.border },
  imageChoiceSelected: { borderColor: Palette.primary, borderWidth: 2 },
  presetPreview: { width: '100%', height: '100%', borderRadius: 7 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 11, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.background },
  sizeChip: { minWidth: 38, alignItems: 'center', paddingHorizontal: 9, paddingVertical: 8, borderRadius: 11, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.background },
  chipSelected: { borderColor: Palette.primary, backgroundColor: Palette.softPink },
  chipText: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 9 },
  chipTextSelected: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold' },
  colorWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  colorOption: { alignItems: 'center', width: 42 },
  colorOuter: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  colorOuterSelected: { borderColor: Palette.primaryDark },
  colorDot: { width: 23, height: 23, borderRadius: 12, borderWidth: 1, borderColor: Palette.border },
  whiteColor: { borderColor: '#D8CCD0' },
  colorLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 7, marginTop: 2 },
  colorLabelSelected: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold' },
  publishButton: { minHeight: 47, alignItems: 'center', justifyContent: 'center', borderRadius: 13, marginTop: 15, backgroundColor: Palette.primary },
  publishText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 0.4 },
  disabled: { opacity: 0.45 },
  formHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 8 },
});
