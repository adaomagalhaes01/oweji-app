import { router } from 'expo-router';
import { LockKeyhole, Mail } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { TextField } from '@/components/ui/text-field';
import { useProfileStore } from '@/store/profile-store';
import { getAccountsForIdentity, getLocalAccounts, normalizePhone, saveLocalAccount } from '@/features/auth/local-accounts';

export default function LoginScreen() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const profile = useProfileStore((state) => state);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const setSignedIn = useProfileStore((state) => state.setSignedIn);
  const [error, setError] = useState('');
  const valid = useMemo(() => /^\S+@\S+\.\S+$/.test(identity.trim()) && password.length >= 6, [identity, password]);
  const signIn = async () => {
    setError('');
    try {
      const accounts = await getLocalAccounts();
      const matchingAccounts = getAccountsForIdentity(accounts, identity);
      let selectedAccount = matchingAccounts.find((account) => account.password === password);
      if (matchingAccounts.length > 0) {
        if (!selectedAccount) { setError('A palavra-passe não está correcta.'); return; }
        const { password: _password, ...savedProfile } = selectedAccount;
        updateProfile(savedProfile);
      } else {
        const normalized = identity.trim().toLowerCase();
        if (accounts.length > 0 || (normalized !== profile.email.trim().toLowerCase() && normalizePhone(normalized) !== normalizePhone(profile.phone))) { setError('Esta conta não foi encontrada neste dispositivo.'); return; }
        // Migrates the pre-existing single-account setup to the local account registry.
        const savedPassword = Platform.OS === 'web' ? null : await (await import('expo-secure-store')).getItemAsync('oweji-password');
        if (savedPassword && savedPassword !== password) { setError('A palavra-passe não está correcta.'); return; }
        selectedAccount = { name: profile.name, email: profile.email, phone: profile.phone, birthDate: profile.birthDate, address: profile.address, businessNif: profile.businessNif, merchantApprovalStatus: profile.merchantApprovalStatus, password, accountType: profile.accountType, storeId: profile.storeId, storeName: profile.storeName, storeDescription: profile.storeDescription, storePhone: profile.storePhone, storeLocation: profile.storeLocation, storeLogoUri: profile.storeLogoUri, avatarUri: profile.avatarUri, addresses: profile.addresses };
        await saveLocalAccount(selectedAccount);
      }
      setSignedIn(true);
      router.replace({ pathname: '/splash', params: { destination: selectedAccount?.accountType === 'merchant' ? 'shop' : 'home' } });
    } catch { setError('Não foi possível validar os dados. Tente novamente.'); }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandHeader}><View style={styles.brand}><Text style={styles.wordmark}>OWEJI</Text></View></View>
          <View style={styles.intro}><Text style={styles.title}>Iniciar sessão</Text></View>
          <TextField label="Email" containerStyle={styles.field} icon={<Mail size={18} color={Palette.textSecondary} />} autoCapitalize="none" keyboardType="email-address" value={identity} onChangeText={setIdentity} placeholder="O seu email" accessibilityLabel="Email" />
          <TextField label="Senha" containerStyle={styles.field} icon={<LockKeyhole size={18} color={Palette.textSecondary} />} value={password} onChangeText={setPassword} placeholder="A sua senha" secureTextEntry={!showPassword} toggle={() => setShowPassword(!showPassword)} visible={showPassword} accessibilityLabel="Senha" />
          <Pressable accessibilityRole="button" onPress={() => router.push('/forgot-password')} style={styles.forgot}><Text style={styles.forgotText}>Esqueceu a palavra-passe?</Text></Pressable>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={!valid} onPress={signIn} style={[styles.primaryButton, !valid && styles.disabled]}><Text style={styles.primaryText}>Iniciar sessão</Text></Pressable>
          <View style={styles.bottomLink}><Text style={styles.bottomText}>Ainda não tem uma conta? </Text><Pressable onPress={() => router.push('/register')}><Text style={styles.link}>Criar conta</Text></Pressable></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: Palette.background }, flex: { flex: 1 }, content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 28 }, brandHeader: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, brand: { alignItems: 'center' }, wordmark: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 21, letterSpacing: 3.5 }, intro: { marginTop: 43, marginBottom: 23 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 26, textAlign: 'center' }, field: { marginTop: 14 }, forgot: { alignSelf: 'flex-end', marginTop: 13, paddingVertical: 4 }, forgotText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 12 }, error: { color: Palette.error, fontFamily: 'Poppins_500Medium', fontSize: 11, marginTop: 8 }, primaryButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary, borderRadius: 15, marginTop: 25 }, primaryText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 13, letterSpacing: 0.2 }, disabled: { opacity: 0.45 }, bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 }, bottomText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12 }, link: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 12 }, });
