import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { TextField, useFieldFocus } from '@/components/ui/text-field';
import { findLocalAccount, saveLocalAccount } from '@/features/auth/local-accounts';
import { completePasswordReset, isPasswordRecoveryApiConfigured, requestPasswordResetCode, verifyPasswordResetCode } from '@/features/auth/password-recovery';

type RecoveryStep = 'email' | 'code' | 'password' | 'done';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const otpInputs = useRef<(TextInput | null)[]>([]);
  const localTestMode = __DEV__ && !isPasswordRecoveryApiConfigured();
  const passwordMismatch = confirmation.length > 0 && password !== confirmation;
  const passwordsMatch = confirmation.length > 0 && password === confirmation;

  useEffect(() => {
    if (resendCountdown === 0) return;
    const timer = setTimeout(() => setResendCountdown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const sendCode = async () => {
    setError('');
    if (!email.trim()) {
      setError('Introduza o seu email.');
      return;
    }
    setBusy(true);
    setStep('code');
    setResendCountdown(120);
    if (localTestMode) {
      setBusy(false);
      return;
    }
    void requestPasswordResetCode(email.trim().toLowerCase())
      .catch(() => undefined)
      .finally(() => setBusy(false));
  };

  const confirmCode = async () => {
    setError('');
    if (!/^\d{6}$/.test(code)) {
      setError('Introduza o código de 6 dígitos.');
      return;
    }
    if (localTestMode) {
      setResetToken('local-development-reset');
      setStep('password');
      return;
    }
    setBusy(true);
    try {
      const token = await verifyPasswordResetCode(email.trim().toLowerCase(), code);
      setResetToken(token);
      setStep('password');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível validar o código.');
    } finally {
      setBusy(false);
    }
  };

  const saveNewPassword = async () => {
    setError('');
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }
    setBusy(true);
    try {
      if (localTestMode) {
        const account = await findLocalAccount(email.trim().toLowerCase());
        if (!account) throw new Error('Esta conta não foi encontrada neste dispositivo.');
        await saveLocalAccount({ ...account, password });
        setStep('done');
        return;
      }
      await completePasswordReset(email.trim().toLowerCase(), resetToken, password);
      setStep('done');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível alterar a senha.');
    } finally {
      setBusy(false);
    }
  };

  const title = step === 'email' ? 'Recuperar senha' : step === 'code' ? 'Verificar código' : step === 'password' ? 'Nova senha' : 'Senha alterada';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => step === 'code' ? setStep('email') : step === 'password' ? setStep('code') : router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color={Palette.text} />
          </Pressable>
          <Text style={styles.wordmark}>OWEJI</Text>
          <View style={styles.form}>
            <Text style={styles.title}>{title}</Text>

            {step === 'email' ? <>
              <Text style={styles.description}>Introduza o seu email para receber um código de verificação.</Text>
              <TextField label="Email" containerStyle={styles.field} accessibilityLabel="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="nome@email.com" />
              <ActionButton label={busy ? 'A ENVIAR…' : 'ENVIAR CÓDIGO'} disabled={busy} onPress={sendCode} />
            </> : null}

            {step === 'code' ? <>
              <Text style={styles.description}>{localTestMode ? 'Modo de teste: qualquer código com 6 dígitos será aceite.' : `Introduza o código enviado para ${email}.`}</Text>
              <Text style={styles.label}>Código OTP</Text>
              <View style={styles.codeBoxes}>
                {Array.from({ length: 6 }, (_, index) => <OtpBox
                  key={index}
                  inputRef={(input) => { otpInputs.current[index] = input; }}
                  index={index}
                  value={code[index] ?? ''}
                  code={code}
                  onChangeCode={(nextCode) => setCode(nextCode)}
                  onAdvance={(nextIndex) => otpInputs.current[nextIndex]?.focus()}
                  onBackspace={(previousIndex) => otpInputs.current[previousIndex]?.focus()}
                />)}
              </View>
              <Pressable accessibilityRole="button" onPress={sendCode} disabled={busy || resendCountdown > 0} style={[styles.resend, (busy || resendCountdown > 0) && styles.resendDisabled]}><Text style={styles.resendText}>{resendCountdown > 0 ? `Reenviar código em ${String(Math.floor(resendCountdown / 60)).padStart(2, '0')}:${String(resendCountdown % 60).padStart(2, '0')}` : 'Reenviar código'}</Text></Pressable>
              <ActionButton label={busy ? 'A VALIDAR…' : 'VERIFICAR CÓDIGO'} disabled={busy} onPress={confirmCode} />
            </> : null}

            {step === 'password' ? <>
              <Text style={styles.description}>Escolha uma nova senha para a sua conta.</Text>
              <TextField label="Nova senha" containerStyle={styles.field} wrapStyle={[passwordMismatch && styles.passwordMismatch, passwordsMatch && styles.passwordMatch]} accessibilityLabel="Nova senha" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} placeholder="Mínimo de 6 caracteres" toggle={() => setShowPassword(!showPassword)} visible={showPassword} />
              <PasswordStrengthMeter password={password} />
              <TextField label="Confirmar senha" containerStyle={styles.field} wrapStyle={[passwordMismatch && styles.passwordMismatch, passwordsMatch && styles.passwordMatch]} accessibilityLabel="Confirmar senha" secureTextEntry={!showConfirmation} value={confirmation} onChangeText={setConfirmation} placeholder="Repita a nova senha" toggle={() => setShowConfirmation(!showConfirmation)} visible={showConfirmation} />
              <ActionButton label={busy ? 'A GUARDAR…' : 'ALTERAR SENHA'} disabled={busy} onPress={saveNewPassword} />
            </> : null}

            {step === 'done' ? <>
              <Text style={styles.description}>A sua senha foi alterada.</Text>
              <ActionButton label="IR PARA O LOGIN" onPress={() => router.replace('/login')} />
            </> : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function OtpBox({ index, value, code, inputRef, onChangeCode, onAdvance, onBackspace }: { index: number; value: string; code: string; inputRef: (input: TextInput | null) => void; onChangeCode: (code: string) => void; onAdvance: (index: number) => void; onBackspace: (index: number) => void }) {
  const { focused, focusProps } = useFieldFocus();
  return <TextInput
    ref={inputRef}
    accessibilityLabel={`Dígito ${index + 1} do código OTP`}
    keyboardType="number-pad"
    value={value}
    onChangeText={(input) => {
      const digits = input.replace(/\D/g, '');
      const nextDigits = code.split('');
      nextDigits[index] = digits[0] ?? '';
      if (digits.length > 1) {
        digits.slice(1, 6 - index).split('').forEach((digit, offset) => { nextDigits[index + offset + 1] = digit; });
      }
      onChangeCode(nextDigits.join('').slice(0, 6));
      if (digits && index < 5) onAdvance(Math.min(index + Math.max(digits.length, 1), 5));
    }}
    onKeyPress={({ nativeEvent }) => {
      if (nativeEvent.key === 'Backspace' && !value && index > 0) onBackspace(index - 1);
    }}
    maxLength={6}
    selectTextOnFocus
    placeholderTextColor={Palette.textSecondary}
    {...focusProps}
    style={[styles.codeBox, focused && styles.codeBoxFocused]}
  />;
}

function ActionButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled, busy: disabled }} disabled={disabled} onPress={onPress} style={[styles.primaryButton, disabled && styles.disabled]}><Text style={styles.primaryButtonText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 30 },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Palette.surface },
  wordmark: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 21, letterSpacing: 3.5, textAlign: 'center', marginTop: 18 },
  form: { width: '100%', maxWidth: 440, alignSelf: 'center', marginTop: 50 },
  title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 25, textAlign: 'center', marginTop: 18 },
  description: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  label: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12, marginBottom: 6, marginTop: 12 },
  field: { marginTop: 12 },
  passwordMismatch: { borderColor: Palette.error },
  passwordMatch: { borderColor: Palette.success },
  codeBoxes: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 2 },
  codeBox: { flex: 1, maxWidth: 45, aspectRatio: 1, padding: 0, borderRadius: 12, borderWidth: 1.5, borderColor: '#F4F1F2', backgroundColor: '#F4F1F2', color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 22, textAlign: 'center' },
  codeBoxFocused: { borderColor: Palette.primary },
  resend: { alignSelf: 'flex-end', paddingVertical: 10 },
  resendText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  resendDisabled: { opacity: 0.55 },
  primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Palette.primary, marginTop: 22 },
  primaryButtonText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 0.5 },
  disabled: { opacity: 0.55 },
  error: { color: Palette.error, fontFamily: 'Poppins_500Medium', fontSize: 12, textAlign: 'center', marginTop: 12 },
});
