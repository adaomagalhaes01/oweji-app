import { router } from 'expo-router';
import { ArrowLeft, CalendarDays, ChevronDown, LockKeyhole, Mail, MapPin, Phone, Store, UserRound } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Palette } from '@/constants/palette';
import { TextField, fieldTheme, useFieldFocus } from '@/components/ui/text-field';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { createStoreId, useProfileStore } from '@/store/profile-store';
import { getLocalAccounts, saveLocalAccount, type LocalAccount } from '@/features/auth/local-accounts';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';

type AccountType = 'customer' | 'merchant';
type Step = 1 | 2 | 3 | 4 | 5;

const COUNTRIES = [
  { code: 'AO', name: 'Angola', dial: '+244', placeholder: '923 456 789' },
  { code: 'PT', name: 'Portugal', dial: '+351', placeholder: '912 345 678' },
] as const;
type CountryCode = (typeof COUNTRIES)[number]['code'];

export default function RegisterScreen() {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('AO');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [address, setAddress] = useState('');
  const [businessNif, setBusinessNif] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const setSignedIn = useProfileStore((state) => state.setSignedIn);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const country = COUNTRIES.find((item) => item.code === countryCode) ?? COUNTRIES[0];
  const phoneDigits = phone.replace(/\D/g, '');
  const businessNifDigits = businessNif.replace(/\D/g, '');
  const isCustomer = accountType === 'customer';
  const typeValid = accountType !== null;
  const personalValid = /^\S+@\S+\.\S+$/.test(email.trim()) && phoneDigits.length === 9 && (isCustomer ? name.trim().length >= 3 : storeName.trim().length >= 2);
  const detailsValid = address.trim().length >= 4 && (isCustomer ? isValidBirthDate(birthDate) : businessNifDigits.length >= 8);
  const securityValid = password.length >= 6 && password === confirmation;
  const stepValid = step === 1 ? typeValid : step === 2 ? personalValid : step === 3 ? detailsValid : step === 4 ? securityValid : typeValid && personalValid && detailsValid && securityValid;
  const changeField = (setter: (value: string) => void) => (value: string) => {
    setError('');
    setter(value);
  };
  const chooseAccountType = (type: AccountType) => {
    setError('');
    setAccountType(type);
  };
  const goNext = () => {
    if (!stepValid || step === 5) return;
    setError('');
    setStep((step + 1) as Step);
  };
  const goBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setError('');
    setStep((step - 1) as Step);
  };
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);
  const createAccount = async () => {
    if (accountType === null) {
      setStep(1);
      return;
    }
    if (!stepValid || submitting) {
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
        name: accountType === 'merchant' ? storeName.trim() : name.trim(),
        email: email.trim(),
        phone: `${country.dial} ${phoneDigits}`,
        birthDate: accountType === 'customer' ? birthDate : '',
        address: address.trim(),
        businessNif: accountType === 'merchant' ? businessNifDigits : '',
        merchantApprovalStatus: accountType === 'merchant' ? 'pending' : null,
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
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} style={styles.back}><ArrowLeft size={20} color={Palette.text} /></Pressable>
          <View style={styles.progressTrack}>
            {[1, 2, 3, 4, 5].map((segment) => <View key={segment} style={[styles.progressSegment, segment <= step && styles.progressSegmentActive]} />)}
          </View>
          <Text style={styles.stepLabel}>Passo {step} de 5</Text>
          {step === 1 ? (
            <>
              <View style={styles.roleList}>
                {(['customer', 'merchant'] as const).map((type) => {
                  const selected = accountType === type;
                  return <Pressable key={type} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={type === 'customer' ? 'Cliente' : 'Comerciante'} onPress={() => chooseAccountType(type)} style={[styles.roleCard, selected && styles.roleCardSelected]}>
                    <View style={[styles.roleIcon, selected && styles.roleIconSelected]}>{type === 'customer' ? <UserRound size={20} color={selected ? Palette.surface : Palette.primaryDark} /> : <Store size={20} color={selected ? Palette.surface : Palette.primaryDark} />}</View>
                    <View style={styles.roleCopy}>
                      <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>{type === 'customer' ? 'Cliente' : 'Comerciante'}</Text>
                      <Text style={styles.roleDescription}>{type === 'customer' ? 'Compre produtos e acompanhe os seus pedidos.' : 'Venda os seus produtos na plataforma.'}</Text>
                    </View>
                    <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
                  </Pressable>;
                })}
              </View>
            </>
          ) : null}
          {step === 2 ? (
            <>
              {isCustomer
                ? <FormField icon={<UserRound size={18} color={Palette.textSecondary} />} label="Nome completo" value={name} onChangeText={changeField(setName)} placeholder="Como podemos chamar-lhe?" />
                : <FormField icon={<Store size={18} color={Palette.textSecondary} />} label="Nome da loja" value={storeName} onChangeText={changeField(setStoreName)} placeholder="Ex.: Atelier Oweji" />}
              <FormField icon={<Mail size={18} color={Palette.textSecondary} />} label="Email" value={email} onChangeText={changeField(setEmail)} placeholder="nome@email.com" keyboardType="email-address" />
              <View style={styles.field}>
                <Text style={fieldTheme.label}>Telefone</Text>
                <PhoneField value={phone} onChangeText={(value) => changeField(setPhone)(value.replace(/\D/g, '').slice(0, 9))} country={country} onPressCountry={() => setCountryPickerVisible(true)} />
              </View>
              {email.length > 0 && !/^\S+@\S+\.\S+$/.test(email.trim()) ? <Text style={styles.error}>Introduza um email válido.</Text> : null}
              {phone.length > 0 && phoneDigits.length < 9 ? <Text style={styles.error}>Introduza um telefone válido com 9 dígitos.</Text> : null}
            </>
          ) : null}
          {step === 3 ? (
            <>
              {isCustomer ? <View>
                <TextField label="Data de nascimento" containerStyle={styles.field} keyboardType="number-pad" value={birthDate} onChangeText={(value) => changeField(setBirthDate)(formatBirthDate(value))} placeholder="DD/MM/AAAA" accessibilityLabel="Data de nascimento" trailing={<Pressable accessibilityRole="button" accessibilityLabel="Escolher data de nascimento" onPress={() => setShowBirthDatePicker(true)} hitSlop={8}><CalendarDays size={18} color={Palette.primaryDark} /></Pressable>} />
                {showBirthDatePicker && Platform.OS !== 'web' ? <View style={styles.datePickerWrap}>
                  <DateTimePicker value={parseBirthDate(birthDate)} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} textColor={Palette.text} themeVariant="light" maximumDate={new Date()} minimumDate={new Date(1900, 0, 1)} onValueChange={(_, selectedDate) => {
                    if (selectedDate) changeField(setBirthDate)(formatDate(selectedDate));
                    if (Platform.OS === 'android') setShowBirthDatePicker(false);
                  }} onDismiss={() => setShowBirthDatePicker(false)} />
                  {Platform.OS === 'ios' ? <Pressable accessibilityRole="button" onPress={() => setShowBirthDatePicker(false)} style={styles.datePickerDone}><Text style={styles.datePickerDoneText}>Concluído</Text></Pressable> : null}
                </View> : null}
              </View> : <FormField icon={<Store size={18} color={Palette.textSecondary} />} label="NIF da empresa" value={businessNif} onChangeText={(value) => changeField(setBusinessNif)(value.replace(/\D/g, ''))} placeholder="Número de identificação fiscal" keyboardType="number-pad" />}
              <FormField icon={<MapPin size={18} color={Palette.textSecondary} />} label="Morada" value={address} onChangeText={changeField(setAddress)} placeholder="Rua, bairro e número" />
              {!isCustomer ? <Text style={styles.storeHint}>A loja ficará pendente até aprovação do administrador.</Text> : null}
              {isCustomer && birthDate.length > 0 && !isValidBirthDate(birthDate) ? <Text style={styles.error}>Introduza uma data válida no formato DD/MM/AAAA.</Text> : null}
              {address.length > 0 && address.trim().length < 4 ? <Text style={styles.error}>Introduza uma morada válida.</Text> : null}
              {!isCustomer && businessNif.length > 0 && businessNifDigits.length < 8 ? <Text style={styles.error}>Introduza um NIF válido.</Text> : null}
            </>
          ) : null}
          {step === 4 ? (
            <>
              <FormField icon={<LockKeyhole size={18} color={Palette.textSecondary} />} label="Senha" value={password} onChangeText={changeField(setPassword)} placeholder="Mínimo de 6 caracteres" secureTextEntry={!showPassword} toggle={() => setShowPassword(!showPassword)} visible={showPassword} />
              <PasswordStrengthMeter password={password} />
              <FormField icon={<LockKeyhole size={18} color={Palette.textSecondary} />} label="Confirmar senha" value={confirmation} onChangeText={changeField(setConfirmation)} placeholder="Repita a sua senha" secureTextEntry={!showConfirmation} toggle={() => setShowConfirmation(!showConfirmation)} visible={showConfirmation} />
              {password.length > 0 && password.length < 6 ? <Text style={styles.error}>Use pelo menos 6 caracteres.</Text> : null}
              {confirmation.length > 0 && password !== confirmation ? <Text style={styles.error}>As senhas não coincidem.</Text> : null}
            </>
          ) : null}
          {step === 5 ? (
            <>
              <View style={styles.summaryCard}>
                {[
                  { label: 'Tipo de conta', value: isCustomer ? 'Cliente' : 'Comerciante' },
                  { label: isCustomer ? 'Nome completo' : 'Nome da loja', value: isCustomer ? name.trim() : storeName.trim() },
                  { label: 'Email', value: email.trim() },
                  { label: 'Telefone', value: `${country.dial} ${formatPhone(phoneDigits)}` },
                  ...(isCustomer ? [{ label: 'Data de nascimento', value: birthDate }] : [{ label: 'NIF da empresa', value: businessNifDigits }]),
                  { label: 'Morada', value: address.trim() },
                ].map((row) => <View key={row.label} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{row.label}</Text>
                  <Text style={styles.summaryValue}>{row.value}</Text>
                </View>)}
              </View>
              {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            </>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !stepValid || submitting, busy: submitting }} disabled={!stepValid || submitting} onPress={step === 5 ? createAccount : goNext} style={[styles.primaryButton, (!stepValid || submitting) && styles.disabled]}><Text style={styles.primaryText}>{step === 5 ? (submitting ? 'A CRIAR CONTA…' : 'CRIAR CONTA') : 'CONTINUAR'}</Text></Pressable>
          {step === 1 ? <View style={styles.bottomLink}><Text style={styles.bottomText}>Já tem uma conta? </Text><Pressable onPress={() => router.push('/login')}><Text style={styles.link}>Entrar</Text></Pressable></View> : null}
        </View>
        <Modal visible={countryPickerVisible} transparent animationType="fade" onRequestClose={() => setCountryPickerVisible(false)}>
          <View style={styles.modalRoot}>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção de indicativo" onPress={() => setCountryPickerVisible(false)} style={StyleSheet.absoluteFill} />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Indicativo do país</Text>
              {COUNTRIES.map((item) => {
                const selected = item.code === countryCode;
                return <Pressable key={item.code} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={`${item.name} ${item.dial}`} onPress={() => { setCountryCode(item.code); setCountryPickerVisible(false); }} style={styles.countryOption}>
                  <CountryFlag code={item.code} />
                  <Text style={styles.countryOptionName}>{item.name}</Text>
                  <Text style={styles.countryOptionDial}>{item.dial}</Text>
                  <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
                </Pressable>;
              })}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormField({ icon, label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry, toggle, visible }: { icon: React.ReactNode; label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad'; secureTextEntry?: boolean; toggle?: () => void; visible?: boolean }) {
  return <TextField label={label} containerStyle={styles.field} icon={icon} keyboardType={keyboardType} value={value} onChangeText={onChangeText} placeholder={placeholder} secureTextEntry={secureTextEntry} toggle={toggle} visible={visible} accessibilityLabel={label} autoCapitalize={keyboardType === 'email-address' || keyboardType === 'number-pad' || keyboardType === 'phone-pad' ? 'none' : 'words'} />;
}

function PhoneField({ value, onChangeText, country, onPressCountry }: { value: string; onChangeText: (value: string) => void; country: (typeof COUNTRIES)[number]; onPressCountry: () => void }) {
  const { focused, focusProps } = useFieldFocus();
  return <View style={[fieldTheme.wrap, focused && fieldTheme.wrapFocused]}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Indicativo ${country.name} ${country.dial}`} onPress={onPressCountry} style={styles.countryButton}>
      <CountryFlag code={country.code} />
      <Text style={styles.dialCode}>{country.dial}</Text>
      <ChevronDown size={14} color={Palette.textSecondary} />
    </Pressable>
    <Phone size={18} color={Palette.textSecondary} />
    <TextInput keyboardType="phone-pad" value={value} onChangeText={onChangeText} placeholder={country.placeholder} placeholderTextColor={Palette.textSecondary} style={fieldTheme.input} accessibilityLabel="Telefone" maxLength={9} {...focusProps} />
  </View>;
}

function CountryFlag({ code }: { code: CountryCode }) {
  if (code === 'PT') return <Svg width={24} height={16} viewBox="0 0 24 16"><Rect width={24} height={16} rx={2} fill="#DA291C" /><Rect width={10} height={16} fill="#046A38" /><Circle cx={10} cy={8} r={3.4} fill="#FFE900" /><Circle cx={10} cy={8} r={1.8} fill="#DA291C" /></Svg>;
  return <Svg width={24} height={16} viewBox="0 0 24 16"><Rect width={24} height={16} rx={2} fill="#CC092F" /><Rect y={8} width={24} height={8} fill="#000000" /><Path d="M12 4.3l.8 1.7 1.9.2-1.4 1.2.4 1.8-1.7-.9-1.7.9.4-1.8-1.4-1.2 1.9-.2z" fill="#FFCB05" /></Svg>;
}

function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

function parseBirthDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return new Date(2000, 0, 1);
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

function formatDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function isValidBirthDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= new Date();
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: '#F4F1F2' },
  progressTrack: { flexDirection: 'row', gap: 6, marginTop: 14 },
  progressSegment: { flex: 1, height: 5, borderRadius: 3, backgroundColor: Palette.border },
  progressSegmentActive: { backgroundColor: Palette.primary },
  stepLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 10, letterSpacing: 0.4, marginTop: 8, textAlign: 'center', textTransform: 'uppercase' },
  field: { marginTop: 14 },
  roleList: { marginTop: 24 },
  roleCard: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 10, borderRadius: 18, backgroundColor: '#F4F1F2', borderWidth: 1.5, borderColor: '#F4F1F2' },
  roleCardSelected: { borderColor: Palette.primary, backgroundColor: Palette.softPink },
  roleIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Palette.softPink },
  roleIconSelected: { backgroundColor: Palette.primaryDark },
  roleCopy: { flex: 1 },
  roleTitle: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  roleTitleSelected: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold' },
  roleDescription: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, lineHeight: 16, marginTop: 3 },
  radio: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, borderWidth: 1.5, borderColor: Palette.border },
  radioSelected: { borderColor: Palette.primaryDark },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Palette.primaryDark },
  countryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 10, borderRightWidth: 1, borderColor: '#E4DEE0' },
  dialCode: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  summaryCard: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F4F1F2' },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingVertical: 9, borderTopWidth: 1, borderColor: '#EAE4E6' },
  summaryLabel: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 1 },
  summaryValue: { flex: 1, color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12, textAlign: 'right' },
  storeHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, lineHeight: 16, marginTop: 6 },
  datePickerWrap: { marginTop: 8, padding: 8, borderRadius: 16, backgroundColor: '#F4F1F2', borderWidth: 1.5, borderColor: Palette.border },
  datePickerDone: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 8 },
  datePickerDoneText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  error: { color: Palette.error, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 6 },
  primaryButton: { minHeight: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary, borderRadius: 16 },
  primaryText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 13, letterSpacing: 0.7 },
  disabled: { opacity: 0.45 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12, backgroundColor: Palette.background, borderTopWidth: 1, borderColor: Palette.border },
  bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  bottomText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12 },
  link: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 12 },
  modalRoot: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: 'rgba(30,20,25,0.38)' },
  modalCard: { padding: 18, borderRadius: 20, backgroundColor: Palette.surface },
  modalTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 16, marginBottom: 8 },
  countryOption: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 6, borderTopWidth: 1, borderColor: Palette.border },
  countryOptionName: { flex: 1, color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 14 },
  countryOptionDial: { color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 12 },
});
