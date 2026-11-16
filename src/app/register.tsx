import { router } from 'expo-router';
import { ArrowLeft, CalendarDays, Check, ChevronDown, Eye, EyeOff, LockKeyhole, Mail, MapPin, Phone, Store, UserRound } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { createStoreId, useProfileStore } from '@/store/profile-store';
import { getLocalAccounts, saveLocalAccount, type LocalAccount } from '@/features/auth/local-accounts';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [address, setAddress] = useState('');
  const [businessNif, setBusinessNif] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accountType, setAccountType] = useState<'customer' | 'merchant'>('customer');
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [rolePickerVisible, setRolePickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const setSignedIn = useProfileStore((state) => state.setSignedIn);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const valid = useMemo(() => /^\S+@\S+\.\S+$/.test(email) && phone.replace(/\D/g, '').length >= 9 && address.trim().length >= 4 && password.length >= 6 && password === confirmation && (accountType === 'customer' ? name.trim().length >= 3 && isValidBirthDate(birthDate) : storeName.trim().length >= 2 && businessNif.replace(/\D/g, '').length >= 8), [name, email, phone, birthDate, address, password, confirmation, accountType, storeName, businessNif]);
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
        name: accountType === 'merchant' ? storeName.trim() : name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        birthDate: accountType === 'customer' ? birthDate : '',
        address: address.trim(),
        businessNif: accountType === 'merchant' ? businessNif.trim() : '',
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
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}><ArrowLeft size={20} color={Palette.text} /></Pressable>
          <Text style={styles.wordmark}>OWEJI</Text>
          <View style={styles.intro}><Text style={styles.title}>Criar conta</Text></View>
          <Text style={styles.label}>Como pretende usar o OWEJI?</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Tipo de conta" accessibilityState={{ expanded: rolePickerVisible }} onPress={() => setRolePickerVisible(true)} style={styles.inputWrap}>
            {accountType === 'customer' ? <UserRound size={17} color={Palette.textSecondary} /> : <Store size={17} color={Palette.textSecondary} />}
            <Text style={styles.selectValue}>{accountType === 'customer' ? 'Cliente' : 'Comerciante'}</Text>
            <ChevronDown size={18} color={Palette.textSecondary} />
          </Pressable>
          {accountType === 'customer' ? <FormField icon={<UserRound size={17} color={Palette.textSecondary} />} label="Nome completo" value={name} onChangeText={changeField(setName)} placeholder="Como podemos chamar-lhe?" /> : null}
          <FormField icon={<Mail size={17} color={Palette.textSecondary} />} label="Email" value={email} onChangeText={changeField(setEmail)} placeholder="nome@email.com" keyboardType="email-address" />
          <FormField icon={<Phone size={17} color={Palette.textSecondary} />} label="Telefone" value={phone} onChangeText={(value) => changeField(setPhone)(value.replace(/[^0-9+ ]/g, ''))} placeholder="+244 900 000 000" keyboardType="phone-pad" />
          {accountType === 'customer' ? <View>
            <Text style={styles.label}>Data de nascimento</Text>
            <View style={styles.inputWrap}>
              <TextInput keyboardType="number-pad" value={birthDate} onChangeText={(value) => changeField(setBirthDate)(formatBirthDate(value))} placeholder="DD/MM/AAAA" placeholderTextColor={Palette.textSecondary} style={styles.input} accessibilityLabel="Data de nascimento" />
              <Pressable accessibilityRole="button" accessibilityLabel="Escolher data de nascimento" onPress={() => setShowBirthDatePicker(true)} hitSlop={8}><CalendarDays size={18} color={Palette.primaryDark} /></Pressable>
            </View>
            {showBirthDatePicker && Platform.OS !== 'web' ? <View style={styles.datePickerWrap}>
              <DateTimePicker value={parseBirthDate(birthDate)} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} textColor={Palette.text} themeVariant="light" maximumDate={new Date()} minimumDate={new Date(1900, 0, 1)} onValueChange={(_, selectedDate) => {
                if (selectedDate) changeField(setBirthDate)(formatDate(selectedDate));
                if (Platform.OS === 'android') setShowBirthDatePicker(false);
              }} onDismiss={() => setShowBirthDatePicker(false)} />
              {Platform.OS === 'ios' ? <Pressable accessibilityRole="button" onPress={() => setShowBirthDatePicker(false)} style={styles.datePickerDone}><Text style={styles.datePickerDoneText}>Concluído</Text></Pressable> : null}
            </View> : null}
          </View> : null}
          <FormField icon={<MapPin size={17} color={Palette.textSecondary} />} label="Morada" value={address} onChangeText={changeField(setAddress)} placeholder="Rua, bairro e número" />
          {accountType === 'merchant' ? <><FormField icon={<Store size={17} color={Palette.textSecondary} />} label="NIF da empresa" value={businessNif} onChangeText={(value) => changeField(setBusinessNif)(value.replace(/\D/g, ''))} placeholder="Número de identificação fiscal" keyboardType="number-pad" /><FormField icon={<Store size={17} color={Palette.textSecondary} />} label="Nome da loja" value={storeName} onChangeText={changeField(setStoreName)} placeholder="Ex.: Atelier Oweji" /><Text style={styles.storeHint}>A loja ficará pendente até aprovação do administrador.</Text></> : null}
          <FormField icon={<LockKeyhole size={17} color={Palette.textSecondary} />} label="Senha" value={password} onChangeText={changeField(setPassword)} placeholder="Mínimo de 6 caracteres" secureTextEntry={!showPassword} toggle={() => setShowPassword(!showPassword)} visible={showPassword} />
          <PasswordStrengthMeter password={password} />
          <FormField icon={<LockKeyhole size={17} color={Palette.textSecondary} />} label="Confirmar senha" value={confirmation} onChangeText={changeField(setConfirmation)} placeholder="Repita a sua senha" secureTextEntry={!showConfirmation} toggle={() => setShowConfirmation(!showConfirmation)} visible={showConfirmation} />
          {password.length > 0 && password.length < 6 ? <Text style={styles.error}>Use pelo menos 6 caracteres.</Text> : null}
          {confirmation.length > 0 && password !== confirmation ? <Text style={styles.error}>As senhas não coincidem.</Text> : null}
          {phone.length > 0 && phone.replace(/\D/g, '').length < 9 ? <Text style={styles.error}>Introduza um telefone válido.</Text> : null}
          {accountType === 'customer' && birthDate.length > 0 && !isValidBirthDate(birthDate) ? <Text style={styles.error}>Introduza uma data válida no formato DD/MM/AAAA.</Text> : null}
          {address.length > 0 && address.trim().length < 4 ? <Text style={styles.error}>Introduza uma morada válida.</Text> : null}
          {accountType === 'merchant' && businessNif.length > 0 && businessNif.replace(/\D/g, '').length < 8 ? <Text style={styles.error}>Introduza um NIF válido.</Text> : null}
          {accountType === 'merchant' && storeName.length > 0 && storeName.trim().length < 2 ? <Text style={styles.error}>O nome da loja precisa de pelo menos 2 caracteres.</Text> : null}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !valid || submitting, busy: submitting }} disabled={!valid || submitting} onPress={createAccount} style={[styles.primaryButton, (!valid || submitting) && styles.disabled]}><Text style={styles.primaryText}>{submitting ? 'A CRIAR CONTA…' : 'CRIAR CONTA'}</Text></Pressable>
          <View style={styles.bottomLink}><Text style={styles.bottomText}>Já tem uma conta? </Text><Pressable onPress={() => router.push('/login')}><Text style={styles.link}>Entrar</Text></Pressable></View>
        </ScrollView>
        <Modal visible={rolePickerVisible} transparent animationType="fade" onRequestClose={() => setRolePickerVisible(false)}>
          <View style={styles.roleModalRoot}>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção de conta" onPress={() => setRolePickerVisible(false)} style={styles.roleModalScrim} />
            <View style={styles.roleModal}>
              <Text style={styles.roleModalTitle}>Tipo de conta</Text>
              {(['customer', 'merchant'] as const).map((type) => {
                const selected = accountType === type;
                return <Pressable key={type} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => { setAccountType(type); setRolePickerVisible(false); }} style={styles.roleOption}>
                  {type === 'customer' ? <UserRound size={18} color={selected ? Palette.primaryDark : Palette.textSecondary} /> : <Store size={18} color={selected ? Palette.primaryDark : Palette.textSecondary} />}
                  <Text style={[styles.roleOptionText, selected && styles.roleOptionSelected]}>{type === 'customer' ? 'Cliente' : 'Comerciante'}</Text>
                  {selected ? <Check size={18} color={Palette.primaryDark} /> : null}
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
  return <View><Text style={styles.label}>{label}</Text><View style={styles.inputWrap}>{icon}<TextInput autoCapitalize={keyboardType === 'email-address' || keyboardType === 'number-pad' || keyboardType === 'phone-pad' ? 'none' : 'words'} keyboardType={keyboardType} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Palette.textSecondary} secureTextEntry={secureTextEntry} style={styles.input} accessibilityLabel={label} />{toggle ? <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={toggle} hitSlop={8}>{visible ? <EyeOff size={17} color={Palette.textSecondary} /> : <Eye size={17} color={Palette.textSecondary} />}</Pressable> : null}</View></View>;
}

function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
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
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Palette.surface },
  wordmark: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 22, letterSpacing: 3, marginTop: 22, textAlign: 'center' },
  intro: { marginTop: 23, marginBottom: 11 },
  title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 25, textAlign: 'center' },
  label: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11, marginBottom: 6, marginTop: 10 },
  selectValue: { flex: 1, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 11 },
  roleModalRoot: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: 'rgba(30,20,25,0.38)' },
  roleModalScrim: { ...StyleSheet.absoluteFill },
  roleModal: { padding: 18, borderRadius: 18, backgroundColor: Palette.surface },
  roleModalTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 15, marginBottom: 8 },
  roleOption: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 10, borderTopWidth: 1, borderColor: Palette.border },
  roleOptionText: { flex: 1, color: Palette.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 12 },
  roleOptionSelected: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold' },
  storeHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 15, marginTop: 5 },
  inputWrap: { minHeight: 47, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, borderRadius: 14, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  input: { flex: 1, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 11, paddingVertical: 0 },
  datePickerWrap: { marginTop: 8, padding: 8, borderRadius: 14, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  datePickerDone: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 8 },
  datePickerDoneText: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  error: { color: Palette.error, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 5 },
  primaryButton: { minHeight: 51, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary, borderRadius: 15, marginTop: 21 },
  primaryText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 0.7 },
  disabled: { opacity: 0.45 },
  bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 19 },
  bottomText: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11 },
  link: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 11 },
});
