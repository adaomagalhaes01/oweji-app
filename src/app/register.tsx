import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Phone, Store, UserRound } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { useProfileStore } from '@/store/profile-store';
import { getPasswordKey } from '@/features/auth/password';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accountType, setAccountType] = useState<'customer' | 'merchant'>('customer');
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const setSignedIn = useProfileStore((state) => state.setSignedIn);
  const valid = useMemo(() => name.trim().length >= 3 && /^\S+@\S+\.\S+$/.test(email) && phone.trim().length >= 8 && password.length >= 6 && password === confirmation && (accountType === 'customer' || storeName.trim().length >= 2), [name, email, phone, password, confirmation, accountType, storeName]);
  const createAccount = async () => {
    if (Platform.OS !== 'web') await SecureStore.setItemAsync(getPasswordKey(email), password);
    updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim(), accountType, storeName: accountType === 'merchant' ? storeName.trim() : '' });
    setSignedIn(true);
    router.replace(accountType === 'merchant' ? '/shop' : '/');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}><ArrowLeft size={20} color={Palette.text} /></Pressable>
          <Text style={styles.wordmark}>OWEJI</Text><Text style={styles.eyebrow}>MARKETPLACE DE MODA</Text>
          <View style={styles.intro}><Text style={styles.title}>Crie a sua conta</Text><Text style={styles.subtitle}>Descubra peças incríveis e encontre o seu estilo.</Text></View>
          <Text style={styles.label}>Como pretende usar o OWEJI?</Text>
          <View style={styles.roles}>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: accountType === 'customer' }} onPress={() => setAccountType('customer')} style={[styles.roleCard, accountType === 'customer' && styles.roleSelected]}><UserRound size={19} color={accountType === 'customer' ? Palette.primaryDark : Palette.textSecondary} /><Text style={styles.roleTitle}>Cliente</Text><Text style={styles.roleDescription}>Descobrir e comprar</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: accountType === 'merchant' }} onPress={() => setAccountType('merchant')} style={[styles.roleCard, accountType === 'merchant' && styles.roleSelected]}><Store size={19} color={accountType === 'merchant' ? Palette.primaryDark : Palette.textSecondary} /><Text style={styles.roleTitle}>Comerciante</Text><Text style={styles.roleDescription}>Criar uma loja</Text></Pressable>
          </View>
          <FormField icon={<UserRound size={17} color={Palette.textSecondary} />} label="Nome completo" value={name} onChangeText={setName} placeholder="Como podemos chamar-lhe?" />
          <FormField icon={<Mail size={17} color={Palette.textSecondary} />} label="Email" value={email} onChangeText={setEmail} placeholder="nome@email.com" keyboardType="email-address" />
          <FormField icon={<Phone size={17} color={Palette.textSecondary} />} label="Número de telefone" value={phone} onChangeText={setPhone} placeholder="+244 900 000 000" keyboardType="phone-pad" />
          {accountType === 'merchant' ? <><FormField icon={<Store size={17} color={Palette.textSecondary} />} label="Nome da loja" value={storeName} onChangeText={setStoreName} placeholder="Ex.: Atelier Oweji" /><Text style={styles.storeHint}>Depois poderá publicar produtos e acompanhar as vendas da sua loja.</Text></> : null}
          <FormField icon={<LockKeyhole size={17} color={Palette.textSecondary} />} label="Palavra-passe" value={password} onChangeText={setPassword} placeholder="Mínimo de 6 caracteres" secureTextEntry={!showPassword} toggle={() => setShowPassword(!showPassword)} visible={showPassword} />
          <FormField icon={<LockKeyhole size={17} color={Palette.textSecondary} />} label="Confirmar palavra-passe" value={confirmation} onChangeText={setConfirmation} placeholder="Repita a palavra-passe" secureTextEntry={!showConfirmation} toggle={() => setShowConfirmation(!showConfirmation)} visible={showConfirmation} />
          {confirmation.length > 0 && password !== confirmation ? <Text style={styles.error}>As palavras-passe não coincidem.</Text> : null}
          {password.length > 0 && password.length < 6 ? <Text style={styles.error}>Use pelo menos 6 caracteres.</Text> : null}
          <Pressable accessibilityRole="button" disabled={!valid} onPress={createAccount} style={[styles.primaryButton, !valid && styles.disabled]}><Text style={styles.primaryText}>{accountType === 'merchant' ? 'CRIAR CONTA E LOJA' : 'CRIAR CONTA'}</Text></Pressable>
          <View style={styles.bottomLink}><Text style={styles.bottomText}>Já tem uma conta? </Text><Pressable onPress={() => router.push('/login')}><Text style={styles.link}>Entrar</Text></Pressable></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormField({ icon, label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry, toggle, visible }: { icon: React.ReactNode; label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'email-address' | 'phone-pad'; secureTextEntry?: boolean; toggle?: () => void; visible?: boolean }) {
  return <View><Text style={styles.label}>{label}</Text><View style={styles.inputWrap}>{icon}<TextInput autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'} keyboardType={keyboardType} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Palette.textSecondary} secureTextEntry={secureTextEntry} style={styles.input} accessibilityLabel={label} />{toggle ? <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'} onPress={toggle} hitSlop={8}>{visible ? <EyeOff size={17} color={Palette.textSecondary} /> : <Eye size={17} color={Palette.textSecondary} />}</Pressable> : null}</View></View>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: Palette.background }, flex: { flex: 1 }, content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 }, back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Palette.surface }, wordmark: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 22, letterSpacing: 3, marginTop: 22 }, eyebrow: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 8, letterSpacing: 1.4, marginTop: 1 }, intro: { marginTop: 23, marginBottom: 11 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 25 }, subtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 19, marginTop: 5 }, label: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11, marginBottom: 6, marginTop: 10 }, roles: { flexDirection: 'row', gap: 10, marginBottom: 5 }, roleCard: { flex: 1, minHeight: 86, padding: 11, borderRadius: 14, alignItems: 'flex-start', justifyContent: 'center', gap: 3, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }, roleSelected: { borderColor: Palette.primary, backgroundColor: '#FFF4F6' }, roleTitle: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11, marginTop: 3 }, roleDescription: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9 }, storeHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 15, marginTop: 5 }, inputWrap: { minHeight: 47, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, borderRadius: 14, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }, input: { flex: 1, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 11, paddingVertical: 0 }, error: { color: Palette.error, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 5 }, primaryButton: { minHeight: 51, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary, borderRadius: 15, marginTop: 21 }, primaryText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 0.7 }, disabled: { opacity: 0.45 }, bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 19 }, bottomText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11 }, link: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 11 } });
