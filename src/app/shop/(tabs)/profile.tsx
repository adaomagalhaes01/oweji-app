import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Camera, CheckCircle2, ChevronRight, CircleAlert, ExternalLink, FileText, LogOut, MapPin, Phone, Store, UserRound } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantHeader } from '@/components/merchant/merchant-header';
import { Palette } from '@/constants/palette';
import { pickImageFromLibrary } from '@/features/media/pick-image';
import { getMerchantProducts } from '@/features/merchant/metrics';
import { useOrdersStore } from '@/store/orders-store';
import { useProfileStore } from '@/store/profile-store';
import { useShopStore } from '@/store/shop-store';

export default function MerchantProfileScreen() {
  const name = useProfileStore((state) => state.name);
  const email = useProfileStore((state) => state.email);
  const storeId = useProfileStore((state) => state.storeId);
  const storeName = useProfileStore((state) => state.storeName);
  const storeDescription = useProfileStore((state) => state.storeDescription);
  const storePhone = useProfileStore((state) => state.storePhone);
  const storeLocation = useProfileStore((state) => state.storeLocation);
  const storeLogoUri = useProfileStore((state) => state.storeLogoUri);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const setSignedIn = useProfileStore((state) => state.setSignedIn);
  const products = useShopStore((state) => state.products);
  const orders = useOrdersStore((state) => state.orders);
  const [editName, setEditName] = useState(storeName);
  const [editDescription, setEditDescription] = useState(storeDescription);
  const [editPhone, setEditPhone] = useState(storePhone);
  const [editLocation, setEditLocation] = useState(storeLocation);
  const [logoUri, setLogoUri] = useState<string | null>(storeLogoUri);
  const [picking, setPicking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const merchantProducts = useMemo(() => getMerchantProducts(products, storeId), [products, storeId]);
  const valid = editName.trim().length >= 2;

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const pickLogo = async () => {
    if (picking) return;
    setPicking(true);
    try {
      const uri = await pickImageFromLibrary({ aspect: [1, 1], prefix: 'loja' });
      if (uri) setLogoUri(uri);
    } catch {
      Alert.alert('Não foi possível abrir a galeria', 'Verifique a permissão de acesso às fotografias e tente novamente.');
    } finally {
      setPicking(false);
    }
  };

  const save = () => {
    if (!valid) {
      setFeedback({ type: 'error', message: 'O nome da loja precisa de pelo menos 2 caracteres.' });
      return;
    }
    updateProfile({
      storeName: editName.trim(),
      storeDescription: editDescription.trim(),
      storePhone: editPhone.trim(),
      storeLocation: editLocation.trim(),
      storeLogoUri: logoUri,
    });
    setFeedback({ type: 'success', message: 'Perfil da loja atualizado. As alterações já aparecem na sua área de comerciante.' });
  };

  const signOut = () => Alert.alert('Sair da conta', 'Tem a certeza de que pretende sair?', [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Sair',
      style: 'destructive',
      onPress: () => {
        setSignedIn(false);
        router.replace('/login');
      },
    },
  ]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <MerchantHeader
          title="A minha loja"
          kicker="PERFIL DA LOJA"
          subtitle="Estes dados identificam a sua loja na aplicação. Pode alterá-los a qualquer momento."
        />

        {feedback ? (
          <View style={[styles.feedback, feedback.type === 'error' && styles.feedbackError]}>
            {feedback.type === 'success' ? <CheckCircle2 size={17} color={Palette.success} /> : <CircleAlert size={17} color={Palette.error} />}
            <Text accessibilityRole="alert" style={[styles.feedbackText, feedback.type === 'error' && styles.feedbackTextError]}>{feedback.message}</Text>
          </View>
        ) : null}

        <View style={styles.logoCard}>
          <Pressable accessibilityRole="button" accessibilityLabel="Alterar logótipo da loja" onPress={pickLogo} style={styles.logoWrap}>
            {logoUri
              ? <Image source={{ uri: logoUri }} style={styles.logoImage} contentFit="cover" />
              : <View style={styles.logoFallback}><Text style={styles.logoInitial}>{storeName.trim().charAt(0).toUpperCase() || 'O'}</Text></View>}
            <View style={styles.cameraBadge}><Camera size={13} color={Palette.surface} /></View>
          </Pressable>
          <View style={styles.logoCopy}>
            <Text style={styles.logoTitle}>{storeName || 'A sua loja'}</Text>
            <Text style={styles.logoHint}>{picking ? 'A abrir a galeria…' : 'Toque no logótipo para escolher uma fotografia quadrada.'}</Text>
            <Text style={styles.storeId}>{storeId || 'Loja ainda sem identificador'}</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.stat}><Text style={styles.statValue}>{merchantProducts.length}</Text><Text style={styles.statLabel}>Produtos</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statValue}>{orders.length}</Text><Text style={styles.statLabel}>Pedidos no dispositivo</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statValue}>{merchantProducts.reduce((sum, product) => sum + product.stock, 0)}</Text><Text style={styles.statLabel}>Unidades em stock</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Informação pública</Text>
        <View style={styles.formCard}>
          <Field label="Nome da loja" value={editName} onChangeText={(value) => { setFeedback(null); setEditName(value); }} placeholder="Ex.: Atelier Oweji" icon={<Store size={16} color={Palette.textSecondary} />} />
          {editName.length > 0 && editName.trim().length < 2 ? <Text style={styles.fieldError}>Use pelo menos 2 caracteres.</Text> : null}
          <Field label="Descrição" value={editDescription} onChangeText={setEditDescription} placeholder="Conte aos clientes o que torna a sua loja especial" icon={<FileText size={16} color={Palette.textSecondary} />} multiline />
          <Field label="Telefone de contacto" value={editPhone} onChangeText={setEditPhone} placeholder="+244 900 000 000" icon={<Phone size={16} color={Palette.textSecondary} />} keyboardType="phone-pad" />
          <Field label="Localização" value={editLocation} onChangeText={setEditLocation} placeholder="Ex.: Luanda, Maianga" icon={<MapPin size={16} color={Palette.textSecondary} />} />
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !valid }} disabled={!valid} onPress={save} style={[styles.saveButton, !valid && styles.disabled]}>
            <Text style={styles.saveText}>GUARDAR PERFIL DA LOJA</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.menuCard}>
          <View style={styles.accountRow}>
            <View style={styles.accountIcon}><UserRound size={17} color={Palette.primaryDark} /></View>
            <View style={styles.accountCopy}><Text style={styles.accountName}>{name}</Text><Text style={styles.accountEmail}>{email}</Text>{Platform.OS === 'web' ? <Text style={styles.accountHint}>Sessão local no navegador</Text> : null}</View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/profile')} style={styles.menuRow}>
            <ExternalLink size={17} color={Palette.primaryDark} />
            <Text style={styles.menuLabel}>Abrir conta de cliente OWEJI</Text>
            <ChevronRight size={16} color={Palette.textSecondary} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={signOut} style={[styles.menuRow, styles.menuRowLast]}>
            <LogOut size={17} color={Palette.primaryDark} />
            <Text style={styles.menuLabel}>Sair da conta</Text>
            <ChevronRight size={16} color={Palette.textSecondary} />
          </Pressable>
        </View>

        <Text style={styles.footnote}>O logótipo e os dados da loja são guardados localmente neste dispositivo. O identificador da loja é usado para isolar produtos e pedidos entre comerciantes.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, icon, multiline = false, keyboardType = 'default' }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; icon: React.ReactNode; multiline?: boolean; keyboardType?: 'default' | 'phone-pad' }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, multiline && styles.inputWrapMultiline]}>
        {icon}
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Palette.textSecondary}
          multiline={multiline}
          keyboardType={keyboardType}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },
  feedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, marginTop: 12, borderRadius: 13, backgroundColor: '#E5F3EA' },
  feedbackError: { backgroundColor: Palette.softPink },
  feedbackText: { flex: 1, color: '#286744', fontFamily: 'Poppins_500Medium', fontSize: 9, lineHeight: 15 },
  feedbackTextError: { color: Palette.error },
  logoCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15, marginTop: 16, borderRadius: 17, backgroundColor: Palette.surface },
  logoWrap: { width: 72, height: 72 },
  logoImage: { width: 72, height: 72, borderRadius: 24 },
  logoFallback: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: Palette.softPink },
  logoInitial: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 26 },
  cameraBadge: { position: 'absolute', right: -1, bottom: -1, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Palette.primary, borderWidth: 2, borderColor: Palette.surface },
  logoCopy: { flex: 1 },
  logoTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 14 },
  logoHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, lineHeight: 13, marginTop: 3 },
  storeId: { color: Palette.primaryDark, fontFamily: 'Poppins_500Medium', fontSize: 7, marginTop: 5, letterSpacing: 0.3 },
  statsCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 10, marginTop: 11, borderRadius: 16, backgroundColor: Palette.softPink },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 15 },
  statLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 7, textAlign: 'center', marginTop: 2 },
  statDivider: { width: 1, height: 27, backgroundColor: 'rgba(201,95,114,0.18)' },
  sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 15, marginTop: 22, marginBottom: 9 },
  formCard: { padding: 15, borderRadius: 17, backgroundColor: Palette.surface },
  field: { marginBottom: 11 },
  fieldLabel: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10, marginBottom: 5 },
  inputWrap: { minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.background },
  inputWrapMultiline: { alignItems: 'flex-start', paddingTop: 11 },
  input: { flex: 1, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 11, paddingVertical: 0 },
  inputMultiline: { minHeight: 55, textAlignVertical: 'top' },
  fieldError: { color: Palette.error, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: -5, marginBottom: 8 },
  saveButton: { minHeight: 45, alignItems: 'center', justifyContent: 'center', marginTop: 2, borderRadius: 13, backgroundColor: Palette.primary },
  saveText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 0.4 },
  disabled: { opacity: 0.45 },
  menuCard: { paddingHorizontal: 14, borderRadius: 17, backgroundColor: Palette.surface },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Palette.border },
  accountIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Palette.softPink },
  accountCopy: { flex: 1 },
  accountName: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  accountEmail: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 2 },
  accountHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 8, marginTop: 2 },
  menuRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: Palette.border },
  menuRowLast: { borderBottomWidth: 0 },
  menuLabel: { flex: 1, color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 11 },
  footnote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, marginTop: 12 },
});
