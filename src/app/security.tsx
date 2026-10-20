import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { getPasswordKey } from '@/features/auth/password';
import { useProfileStore } from '@/store/profile-store';

export default function SecurityScreen() {
  const email = useProfileStore((state) => state.email);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setError('');
    if (current.length < 6 || next.length < 6 || confirm.length < 6) { setError('Preencha os três campos com pelo menos 6 caracteres.'); return; }
    if (next !== confirm) { setError('A nova palavra-passe e a confirmação são diferentes.'); return; }
    if (current === next) { setError('Escolha uma palavra-passe diferente da actual.'); return; }
    setBusy(true);
    try {
      const key = getPasswordKey(email);
      const saved = Platform.OS === 'web' ? null : await SecureStore.getItemAsync(key);
      if (!saved) { setError('Esta conta ainda não tem palavra-passe guardada neste dispositivo. A validação para contas antigas depende do servidor de autenticação.'); setBusy(false); return; }
      if (saved !== current) { setError('A palavra-passe actual não está correcta.'); setBusy(false); return; }
      if (Platform.OS !== 'web') await SecureStore.setItemAsync(key, next);
      setCurrent(''); setNext(''); setConfirm('');
      Alert.alert('Palavra-passe alterada', 'A nova palavra-passe foi guardada com segurança neste dispositivo.');
    } catch {
      setError('Não foi possível validar a palavra-passe. Tente novamente.');
    } finally { setBusy(false); }
  };
  return <SafeAreaView edges={['top']} style={styles.safeArea}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><ArrowLeft size={19} color={Palette.text} /></Pressable><View><Text style={styles.kicker}>A MINHA CONTA</Text><Text style={styles.title}>Segurança</Text></View></View>
    <View style={styles.notice}><ShieldCheck size={18} color={Palette.primaryDark} /><Text style={styles.noticeText}>Para alterar a palavra-passe, confirme a actual e introduza a nova duas vezes. Não precisa de sair nem de voltar a entrar.</Text></View>
    <View style={styles.card}><Text style={styles.cardTitle}>Alterar palavra-passe</Text><Text style={styles.cardSubtitle}>Use pelo menos 6 caracteres.</Text><PasswordField label="Palavra-passe actual" value={current} onChangeText={setCurrent} visible={visible} onToggle={() => setVisible(!visible)} /><PasswordField label="Nova palavra-passe" value={next} onChangeText={setNext} visible={visible} onToggle={() => setVisible(!visible)} /><PasswordField label="Confirmar nova palavra-passe" value={confirm} onChangeText={setConfirm} visible={visible} onToggle={() => setVisible(!visible)} />{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}<Pressable accessibilityRole="button" disabled={busy} onPress={submit} style={[styles.submit, busy && styles.disabled]}><LockKeyhole size={16} color={Palette.surface} /><Text style={styles.submitText}>{busy ? 'A VALIDAR…' : 'ALTERAR PALAVRA-PASSE'}</Text></Pressable></View>
    <Text style={styles.footnote}>A palavra-passe é guardada no armazenamento seguro do dispositivo. A validação com uma conta online requer a integração do servidor de autenticação.</Text>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
function PasswordField({ label, value, onChangeText, visible, onToggle }: { label: string; value: string; onChangeText: (value: string) => void; visible: boolean; onToggle: () => void }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={styles.inputWrap}><LockKeyhole size={16} color={Palette.textSecondary} /><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder="Mínimo de 6 caracteres" placeholderTextColor={Palette.textSecondary} secureTextEntry={!visible} autoCapitalize="none" style={styles.input} /><Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar palavras-passe' : 'Mostrar palavras-passe'} onPress={onToggle} hitSlop={8}>{visible ? <EyeOff size={17} color={Palette.textSecondary} /> : <Eye size={17} color={Palette.textSecondary} />}</Pressable></View></View>; }
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: Palette.background }, flex: { flex: 1 }, content: { padding: 20, paddingBottom: 35 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 }, back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Palette.surface }, kicker: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 1.5 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 22, marginTop: 3 }, notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 13, marginBottom: 13, borderRadius: 15, backgroundColor: Palette.softPink }, noticeText: { flex: 1, color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 15 }, card: { padding: 16, borderRadius: 17, backgroundColor: Palette.surface }, cardTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 14 }, cardSubtitle: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, marginTop: 3 }, field: { marginTop: 14 }, label: { color: Palette.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 9, marginBottom: 6 }, inputWrap: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Palette.background, borderWidth: 1, borderColor: Palette.border }, input: { flex: 1, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 10, paddingVertical: 0 }, error: { color: Palette.error, fontFamily: 'Poppins_500Medium', fontSize: 9, lineHeight: 15, marginTop: 10 }, submit: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, borderRadius: 13, backgroundColor: Palette.primary }, submitText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 0.35 }, disabled: { opacity: 0.6 }, footnote: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 15, marginTop: 14, paddingHorizontal: 4 } });
