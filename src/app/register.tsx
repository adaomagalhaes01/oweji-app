import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Store, UserRound } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { createStoreId, useProfileStore } from '@/store/profile-store';
import { getLocalAccounts, saveLocalAccount, type LocalAccount } from '@/features/auth/local-accounts';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'customer' | 'merchant'>('customer');
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const setSignedIn = useProfileStore((state) => state.setSignedIn);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const valid = useMemo(() => name.trim().length >= 3 && /^\S+@\S+\.\S+$/.test(email) && password.length >= 6 && (accountType === 'customer' || storeName.trim().length >= 2), [name, email, password, accountType, storeName]);
  const changeField = (setter: (value: string) => void) => (value: string) => {
    setError('');
    setter(value);
  };
  const createAccount = async () => {
    if (!valid || submitting) {
      setError('Preencha todos os dados obrigatórios corretamente para continuar.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const accounts = await getLocalAccounts();
      if (accounts.some((account) => account.email.trim().toLowerCase() === email.trim().toLowerCase())) {
        setError('Já existe uma conta com este email neste dispositivo. Entre ou use outro email.');
        setSubmitting(false);
        return;
      }
      const account: LocalAccount = {
        name: name.trim(),
        email: email.trim(),
        phone: '',
        password,
        accountType,
        storeId: accountType === 'merchant' ? createStoreId() : '',
        storeName: accountType === 'merchant' ? storeName.trim() : '',
        storeDescription: '',
        storePhone: '',
        storeLocation: '',
        storeLogoUri: null,
        avatarUri: null,
        addresses: [],
      };
      await saveLocalAccount(account);
      updateProfile(account);
      clearCart();
      clearFavorites();
      setSignedIn(true);
      if (accountType === 'merchant') {
        router.replace({ pathname: '/splash', params: { destination: 'shop' } });
      } else {
        router.replace('/');
      }
    } catch {
      setError('Não foi possível criar a conta. Verifique os dados e tente novamente.');
      setSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}><ArrowLeft size={20} color={Palette.text} /></Pressable>
          <Text style={styles.wordmark}>OWEJI</Text>
          <View style={styles.intro}><Text style={styles.title}>Criar conta</Text></View>
          <Text style={styles.label}>Como pretende usar o OWEJI?</Text>
          <View style={styles.roles}>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: accountType === 'customer' }} onPress={() => setAccountType('customer')} style={[styles.roleCard, accountType === 'customer' && styles.roleSelected]}><UserRound size={19} color={accountType === 'customer' ? Palette.primaryDark : Palette.textSecondary} /><Text style={styles.roleTitle}>Cliente</Text><Text style={styles.roleDescription}>Descobrir e comprar</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: accountType === 'merchant' }} onPress={() => setAccountType('merchant')} style={[styles.roleCard, accountType === 'merchant' && styles.roleSelected]}><Store size={19} color={accountType === 'merchant' ? Palette.primaryDark : Palette.textSecondary} /><Text style={styles.roleTitle}>Comerciante</Text><Text style={styles.roleDescription}>Criar uma loja</Text></Pressable>
          </View>
          <FormField icon={<UserRound size={17} color={Palette.textSecondary} />} label="Nome completo" value={name} onChangeText={changeField(setName)} placeholder="Como podemos chamar-lhe?" />
          <FormField icon={<Mail size={17} color={Palette.textSecondary} />} label="Email" value={email} onChangeText={changeField(setEmail)} placeholder="nome@email.com" keyboardType="email-address" />
          {accountType === 'merchant' ? <><FormField icon={<Store size={17} color={Palette.textSecondary} />} label="Nome da loja" value={storeName} onChangeText={changeField(setStoreName)} placeholder="Ex.: Atelier Oweji" /><Text style={styles.storeHint}>Depois poderá publicar produtos e acompanhar as vendas da sua loja.</Text></> : null}
          <FormField icon={<LockKeyhole size={17} color={Palette.textSecondary} />} label="Senha" value={password} onChangeText={changeField(setPassword)} placeholder="Mínimo de 6 caracteres" secureTextEntry={!showPassword} toggle={() => setShowPassword(!showPassword)} visible={showPassword} />
          {password.length > 0 && password.length < 6 ? <Text style={styles.error}>Use pelo menos 6 caracteres.</Text> : null}
          {accountType === 'merchant' && storeName.length > 0 && storeName.trim().length < 2 ? <Text style={styles.error}>O nome da loja precisa de pelo menos 2 caracteres.</Text> : null}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !valid || submitting, busy: submitting }} disabled={!valid || submitting} onPress={createAccount} style={[styles.primaryButton, (!valid || submitting) && styles.disabled]}><Text style={styles.primaryText}>{submitting ? 'A CRIAR CONTA…' : accountType === 'merchant' ? 'CRIAR CONTA E LOJA' : 'CRIAR CONTA'}</Text></Pressable>
          <View style={styles.bottomLink}><Text style={styles.bottomText}>Já tem uma conta? </Text><Pressable onPress={() => router.push('/login')}><Text style={styles.link}>Entrar</Text></Pressable></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormField({ icon, label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry, toggle, visible }: { icon: React.ReactNode; label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'email-address' | 'phone-pad'; secureTextEntry?: boolean; toggle?: () => void; visible?: boolean }) {
  return <View><Text style={styles.label}>{label}</Text><View style={styles.inputWrap}>{icon}<TextInput autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'} keyboardType={keyboardType} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Palette.textSecondary} secureTextEntry={secureTextEntry} style={styles.input} accessibilityLabel={label} />{toggle ? <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'} onPress={toggle} hitSlop={8}>{visible ? <EyeOff size={17} color={Palette.textSecondary} /> : <Eye size={17} color={Palette.textSecondary} />}</Pressable> : null}</View></View>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: Palette.background }, flex: { flex: 1 }, content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 }, back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Palette.surface }, wordmark: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 22, letterSpacing: 3, marginTop: 22, textAlign: 'center' }, intro: { marginTop: 23, marginBottom: 11 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 25, textAlign: 'center' }, label: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11, marginBottom: 6, marginTop: 10 }, roles: { flexDirection: 'row', gap: 10, marginBottom: 5 }, roleCard: { flex: 1, minHeight: 86, padding: 11, borderRadius: 14, alignItems: 'flex-start', justifyContent: 'center', gap: 3, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }, roleSelected: { borderColor: Palette.primary, backgroundColor: '#FFF4F6' }, roleTitle: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11, marginTop: 3 }, roleDescription: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9 }, storeHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 15, marginTop: 5 }, inputWrap: { minHeight: 47, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, borderRadius: 14, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }, input: { flex: 1, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 11, paddingVertical: 0 }, error: { color: Palette.error, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 5 }, primaryButton: { minHeight: 51, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary, borderRadius: 15, marginTop: 21 }, primaryText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 0.7 }, disabled: { opacity: 0.45 }, bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 19 }, bottomText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11 }, link: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 11 } });
