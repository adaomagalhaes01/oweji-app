import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { useProfileStore } from '@/store/profile-store';

export default function LoginScreen() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const accountType = useProfileStore((state) => state.accountType);
  const valid = useMemo(() => identity.trim().length > 3 && password.length >= 6, [identity, password]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}><ArrowLeft size={20} color={Palette.text} /></Pressable>
            <View style={styles.brand}><Text style={styles.wordmark}>OWEJI</Text><Text style={styles.eyebrow}>MARKETPLACE DE MODA</Text></View>
            <View style={styles.backPlaceholder} />
          </View>
          <View style={styles.intro}><Text style={styles.title}>Que bom ter você de volta.</Text><Text style={styles.subtitle}>Entre na sua conta e continue a descobrir peças com a sua personalidade.</Text></View>
          <Text style={styles.label}>Email ou número de telefone</Text><View style={styles.inputWrap}><Mail size={18} color={Palette.textSecondary} /><TextInput autoCapitalize="none" keyboardType="email-address" value={identity} onChangeText={setIdentity} placeholder="O seu email ou telefone" placeholderTextColor={Palette.textSecondary} style={styles.input} accessibilityLabel="Email ou telefone" /></View>
          <Text style={styles.label}>Palavra-passe</Text><View style={styles.inputWrap}><LockKeyhole size={18} color={Palette.textSecondary} /><TextInput value={password} onChangeText={setPassword} placeholder="A sua palavra-passe" placeholderTextColor={Palette.textSecondary} secureTextEntry={!showPassword} style={styles.input} accessibilityLabel="Palavra-passe" /><Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'} onPress={() => setShowPassword(!showPassword)} hitSlop={8}>{showPassword ? <EyeOff size={18} color={Palette.textSecondary} /> : <Eye size={18} color={Palette.textSecondary} />}</Pressable></View>
          <Pressable accessibilityRole="button" onPress={() => Alert.alert('Recuperar palavra-passe', 'Entre em contacto com o suporte OWEJI para recuperar o acesso à sua conta.')} style={styles.forgot}><Text style={styles.forgotText}>Esqueceu a palavra-passe?</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={!valid} onPress={() => router.replace({ pathname: '/splash', params: { destination: accountType === 'merchant' ? 'shop' : 'home' } })} style={[styles.primaryButton, !valid && styles.disabled]}><Text style={styles.primaryText}>ENTRAR</Text></Pressable>
          <View style={styles.bottomLink}><Text style={styles.bottomText}>Ainda não tem uma conta? </Text><Pressable onPress={() => router.push('/register')}><Text style={styles.link}>Criar conta</Text></Pressable></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: Palette.background }, flex: { flex: 1 }, content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 28 }, brandHeader: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Palette.surface }, backPlaceholder: { width: 40 }, brand: { alignItems: 'center' }, wordmark: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 21, letterSpacing: 4 }, eyebrow: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 7, letterSpacing: 1.2, marginTop: 1 }, intro: { marginTop: 43, marginBottom: 23 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 24 }, subtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 19, marginTop: 6 }, label: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12, marginBottom: 8, marginTop: 14 }, inputWrap: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 15, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }, input: { flex: 1, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 12, paddingVertical: 0 }, forgot: { alignSelf: 'flex-end', marginTop: 13, paddingVertical: 4 }, forgotText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 11 }, primaryButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary, borderRadius: 15, marginTop: 25 }, primaryText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 0.7 }, disabled: { opacity: 0.45 }, bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 }, bottomText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11 }, link: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 11 }, });
