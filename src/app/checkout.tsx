import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { ArrowLeft, FileCheck2, MapPin, ShieldCheck, Upload } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { formatPrice } from '@/features/products/data';
import { getProductCatalog } from '@/features/products/catalog';
import type { OrderReceipt } from '@/store/orders-store';
import { useOrdersStore } from '@/store/orders-store';
import { useCartStore } from '@/store/cart-store';
import type { DeliveryAddress } from '@/store/profile-store';
import { useProfileStore } from '@/store/profile-store';
import { useShopStore } from '@/store/shop-store';

const SHIPPING_FEE = 500;
const MAX_RECEIPT_SIZE = 10 * 1024 * 1024;

export default function CheckoutScreen() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const sellerProducts = useShopStore((state) => state.products);
  const addOrder = useOrdersStore((state) => state.addOrder);
  const profileName = useProfileStore((state) => state.name);
  const profileEmail = useProfileStore((state) => state.email);
  const profilePhone = useProfileStore((state) => state.phone);
  const savedAddresses = useProfileStore((state) => state.addresses);
  const saveAddress = useProfileStore((state) => state.saveAddress);
  const catalog = useMemo(() => getProductCatalog(sellerProducts), [sellerProducts]);
  const lines = useMemo(() => items.flatMap((item) => {
    const product = catalog.find((entry) => entry.id === item.productId);
    return product ? [{ ...item, name: product.name, unitPrice: product.price }] : [];
  }), [catalog, items]);
  const subtotal = lines.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  const shipping = lines.length > 0 ? SHIPPING_FEE : 0;
  const [fullName, setFullName] = useState(profileName);
  const [email, setEmail] = useState(profileEmail);
  const [phone, setPhone] = useState(profilePhone);
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [address, setAddress] = useState('');
  const [reference, setReference] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const applySavedAddress = useCallback((saved: DeliveryAddress) => {
    setSelectedAddressId(saved.id);
    setFullName(saved.fullName); setPhone(saved.phone); setProvince(saved.province); setMunicipality(saved.municipality); setAddress(saved.address); setReference(saved.reference);
  }, []);
  const clearSelectedAddress = () => setSelectedAddressId('');

  const pickReceipt = async () => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (file.size && file.size > MAX_RECEIPT_SIZE) {
        setError('O comprovativo deve ter no máximo 10 MB.');
        return;
      }
      setReceipt({ name: file.name, uri: file.uri, mimeType: file.mimeType, size: file.size });
    } catch {
      setError('Não foi possível abrir os documentos. Tente novamente.');
    }
  };

  const submitOrder = () => {
    const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());
    const validPhone = phone.replace(/\D/g, '').length >= 9;
    if (!fullName.trim() || !validEmail || !validPhone || !province.trim() || !municipality.trim() || !address.trim() || !receipt) {
      setError('Preencha os dados de entrega e anexe o comprovativo para continuar.');
      return;
    }
    if (!lines.length) {
      setError('O carrinho já não tem produtos disponíveis.');
      return;
    }

    setSubmitting(true);
    try {
      if (saveThisAddress) {
        const selected = savedAddresses.find((item) => item.id === selectedAddressId);
        saveAddress({ id: selected?.id, label: selected?.label ?? 'Morada de entrega', fullName: fullName.trim(), phone: phone.trim(), province: province.trim(), municipality: municipality.trim(), address: address.trim(), reference: reference.trim(), isDefault: selected?.isDefault ?? savedAddresses.length === 0 });
      }
      addOrder({
        lines: lines.map(({ productId, name, unitPrice, quantity, size, color }) => ({ productId, name, unitPrice, quantity, size, color })),
        subtotal,
        shipping,
        total: subtotal + shipping,
        status: 'payment-review',
        paymentMethod: 'bank-transfer',
        paymentReference: paymentReference.trim(),
        receipt,
        delivery: { fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), province: province.trim(), municipality: municipality.trim(), address: address.trim(), reference: reference.trim() },
      });
      clearCart();
      router.replace('/orders');
    } catch {
      Alert.alert('Não foi possível registar', 'O pedido não foi guardado. Verifique o espaço disponível e tente novamente.');
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.emptyWrap}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}><ArrowLeft size={19} color={Palette.text} /></Pressable>
          <Text style={styles.emptyTitle}>O carrinho está vazio</Text>
          <Text style={styles.emptyCopy}>Adicione uma peça antes de finalizar a compra.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>VER PEÇAS</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao carrinho" onPress={() => router.back()} style={styles.backButton}><ArrowLeft size={19} color={Palette.text} /></Pressable>
            <View><Text style={styles.kicker}>QUASE LÁ</Text><Text style={styles.title}>Finalizar compra</Text></View>
          </View>

          <View style={styles.notice}><ShieldCheck size={18} color={Palette.primaryDark} /><Text style={styles.noticeText}>Os dados do pedido e o comprovativo ficam guardados neste dispositivo. O envio à loja e a confirmação do pagamento dependem da integração do servidor OWEJI.</Text></View>

          <Section title="Dados para entrega" icon={<MapPin size={17} color={Palette.primaryDark} />}>
            <View style={styles.savedAddressHeading}><Text style={styles.savedAddressLabel}>Morada guardada</Text><Text style={styles.optional}>opcional</Text></View>
            {savedAddresses.length ? <View style={styles.savedAddressList}>{savedAddresses.map((saved) => <Pressable key={saved.id} accessibilityRole="button" accessibilityState={{ selected: selectedAddressId === saved.id }} onPress={() => applySavedAddress(saved)} style={[styles.savedAddressChip, selectedAddressId === saved.id && styles.savedAddressChipSelected]}><Text style={[styles.savedAddressChipTitle, selectedAddressId === saved.id && styles.savedAddressChipTitleSelected]}>{saved.label}</Text><Text numberOfLines={1} style={styles.savedAddressChipMeta}>{saved.municipality}, {saved.province}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityState={{ selected: !selectedAddressId }} onPress={clearSelectedAddress} style={[styles.savedAddressChip, !selectedAddressId && styles.savedAddressChipSelected]}><Text style={[styles.savedAddressChipTitle, !selectedAddressId && styles.savedAddressChipTitleSelected]}>Preencher manualmente</Text></Pressable></View> : <Text style={styles.noSavedAddress}>Ainda não tem moradas guardadas. Pode preencher abaixo e guardar para outra compra.</Text>}
            <Field label="Nome completo" value={fullName} onChangeText={setFullName} placeholder="Nome de quem vai receber" autoCapitalize="words" />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="nome@email.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Telefone" value={phone} onChangeText={setPhone} placeholder="+244 900 000 000" keyboardType="phone-pad" />
            <View style={styles.twoColumns}><View style={styles.column}><Field label="Província" value={province} onChangeText={setProvince} placeholder="Ex.: Luanda" autoCapitalize="words" /></View><View style={styles.column}><Field label="Município" value={municipality} onChangeText={setMunicipality} placeholder="Ex.: Maianga" autoCapitalize="words" /></View></View>
            <Field label="Morada completa" value={address} onChangeText={setAddress} placeholder="Rua, número, bairro e edifício" autoCapitalize="words" />
            <Field label="Ponto de referência (opcional)" value={reference} onChangeText={setReference} placeholder="Ex.: perto do mercado" autoCapitalize="sentences" />
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: saveThisAddress }} onPress={() => setSaveThisAddress(!saveThisAddress)} style={styles.saveAddressToggle}><View style={[styles.checkbox, saveThisAddress && styles.checkboxChecked]} /><Text style={styles.saveAddressText}>Guardar esta morada para futuras compras</Text></Pressable>
          </Section>

          <Section title="Pagamento" icon={<FileCheck2 size={17} color={Palette.primaryDark} />}>
            <View style={styles.paymentMethod}><View style={styles.radioOuter}><View style={styles.radioInner} /></View><View style={styles.paymentMethodCopy}><Text style={styles.paymentMethodTitle}>Transferência ou depósito</Text><Text style={styles.paymentMethodHint}>Anexe o comprovativo para a loja validar o pagamento.</Text></View></View>
            <View style={styles.paymentInstructions}><Text style={styles.paymentInstructionsTitle}>Dados do beneficiário</Text><Text style={styles.paymentInstructionsText}>Os dados bancários ou Multicaixa Express da OWEJI ainda não estão configurados nesta aplicação. Confirme os dados oficiais com a loja antes de transferir dinheiro.</Text></View>
            <Field label="Referência da transferência (opcional)" value={paymentReference} onChangeText={setPaymentReference} placeholder="Número ou código da operação" autoCapitalize="characters" />
            <View style={styles.uploadButton}>
              <Pressable accessibilityRole="button" onPress={pickReceipt} style={styles.uploadAction}>
              {receipt ? <FileCheck2 size={18} color={Palette.primaryDark} /> : <Upload size={18} color={Palette.primaryDark} />}
              <View style={styles.uploadCopy}><Text style={styles.uploadTitle}>{receipt ? 'Comprovativo anexado' : 'Anexar comprovativo'}</Text><Text numberOfLines={1} style={styles.uploadHint}>{receipt ? receipt.name : 'Imagem ou PDF · até 10 MB'}</Text></View>
              </Pressable>
              {receipt ? <Pressable accessibilityRole="button" accessibilityLabel="Remover comprovativo" onPress={() => setReceipt(null)} hitSlop={10}><Text style={styles.removeFile}>Remover</Text></Pressable> : null}
            </View>
          </Section>

          <Section title="Resumo do pedido">
            {lines.map((line, index) => <View key={`${line.productId}-${line.size}-${line.color}-${index}`} style={styles.summaryLine}><View style={styles.summaryCopy}><Text numberOfLines={1} style={styles.summaryName}>{line.name}</Text><Text style={styles.summaryMeta}>{line.quantity} × {formatPrice(line.unitPrice)} · {line.size}</Text></View><Text style={styles.summaryPrice}>{formatPrice(line.quantity * line.unitPrice)}</Text></View>)}
            <View style={styles.divider} />
            <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
            <SummaryRow label="Entrega estimada" value={formatPrice(shipping)} />
            <SummaryRow label="Total" value={formatPrice(subtotal + shipping)} bold />
          </Section>

          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={submitting} onPress={submitOrder} style={[styles.primaryButton, submitting && styles.disabled]}><Text style={styles.primaryButtonText}>{submitting ? 'A REGISTAR…' : 'ENVIAR PEDIDO E COMPROVATIVO'}</Text></Pressable>
          <Text style={styles.footerHint}>Ao continuar, confirma que os dados de entrega estão correctos.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <View style={styles.section}><View style={styles.sectionHeading}>{icon}{<Text style={styles.sectionTitle}>{title}</Text>}</View>{children}</View>;
}

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', autoCapitalize = 'sentences' }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'email-address' | 'phone-pad'; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Palette.textSecondary} keyboardType={keyboardType} autoCapitalize={autoCapitalize} style={styles.input} /></View>;
}

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return <View style={styles.totalRow}><Text style={[styles.totalLabel, bold && styles.totalLabelBold]}>{label}</Text><Text style={[styles.totalValue, bold && styles.totalValueBold]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background }, flex: { flex: 1 }, content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }, backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Palette.surface }, kicker: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 1.6 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 22, marginTop: 2 }, savedAddressHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 }, savedAddressLabel: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, optional: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8 }, savedAddressList: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 }, savedAddressChip: { maxWidth: '100%', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, backgroundColor: Palette.background, borderWidth: 1, borderColor: Palette.border }, savedAddressChipSelected: { borderColor: Palette.primary, backgroundColor: '#FFF8FA' }, savedAddressChipTitle: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 9 }, savedAddressChipTitleSelected: { color: Palette.primaryDark }, savedAddressChipMeta: { maxWidth: 150, color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 }, noSavedAddress: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, marginTop: 5 }, saveAddressToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }, checkbox: { width: 17, height: 17, borderRadius: 5, borderWidth: 1, borderColor: Palette.border }, checkboxChecked: { backgroundColor: Palette.primary, borderColor: Palette.primary }, saveAddressText: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 9 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 12, borderRadius: 14, backgroundColor: Palette.softPink, marginBottom: 13 }, noticeText: { flex: 1, color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 15 },
  section: { padding: 15, marginBottom: 12, borderRadius: 17, backgroundColor: Palette.surface }, sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }, sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 14 }, field: { marginTop: 10 }, fieldLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginBottom: 5 }, input: { minHeight: 45, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.background, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 11 }, twoColumns: { flexDirection: 'row', gap: 10 }, column: { flex: 1, minWidth: 0 },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, marginTop: 8, borderRadius: 13, borderWidth: 1, borderColor: Palette.primary, backgroundColor: '#FFF8FA' }, radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center' }, radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: Palette.primaryDark }, paymentMethodCopy: { flex: 1 }, paymentMethodTitle: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11 }, paymentMethodHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 2 }, paymentInstructions: { padding: 11, marginTop: 10, borderRadius: 12, backgroundColor: Palette.background }, paymentInstructionsTitle: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, paymentInstructionsText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 15, marginTop: 4 },
  uploadButton: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, marginTop: 12, borderRadius: 13, borderWidth: 1, borderStyle: 'dashed', borderColor: Palette.primary, backgroundColor: '#FFF8FA' }, uploadAction: { flex: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10 }, uploadCopy: { flex: 1 }, uploadTitle: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 10 }, uploadHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 2 }, removeFile: { color: Palette.error, fontFamily: 'Poppins_600SemiBold', fontSize: 9 },
  summaryLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 8 }, summaryCopy: { flex: 1 }, summaryName: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, summaryMeta: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 2 }, summaryPrice: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 }, divider: { height: 1, backgroundColor: Palette.border, marginVertical: 8 }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 }, totalLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10 }, totalValue: { color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 10 }, totalLabelBold: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 12 }, totalValueBold: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 14 },
  error: { color: Palette.error, fontFamily: 'Poppins_500Medium', fontSize: 10, lineHeight: 16, marginBottom: 10 }, primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Palette.primary, marginTop: 4 }, primaryButtonText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 0.45 }, disabled: { opacity: 0.55 }, footerHint: { color: Palette.textSecondary, textAlign: 'center', fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 9 },
  emptyWrap: { flex: 1, justifyContent: 'center', padding: 24 }, emptyTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 20, marginTop: 20 }, emptyCopy: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 6 },
});
