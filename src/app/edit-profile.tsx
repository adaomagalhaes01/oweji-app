import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { TextField } from '@/components/ui/text-field';
import { deleteLocalAccount, findLocalAccount, saveLocalAccount } from '@/features/auth/local-accounts';
import { useProfileStore } from '@/store/profile-store';

export default function EditProfileScreen() {
  const name = useProfileStore((state) => state.name);
  const email = useProfileStore((state) => state.email);
  const phone = useProfileStore((state) => state.phone);
  const avatarUri = useProfileStore((state) => state.avatarUri);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);
  const [avatar, setAvatar] = useState<string | null>(avatarUri);
  const [saving, setSaving] = useState(false);
  const valid = editName.trim().length >= 3 && /^\S+@\S+\.\S+$/.test(editEmail.trim()) && editPhone.replace(/\D/g, '').length >= 9;

  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled) setAvatar(result.assets[0].uri);
    } catch {
      Alert.alert('Não foi possível abrir as fotografias', 'Tente novamente.');
    }
  };

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const next = { name: editName.trim(), email: editEmail.trim(), phone: editPhone.trim(), avatarUri: avatar };
      updateProfile(next);
      const account = await findLocalAccount(email);
      if (account) {
        if (email.trim().toLowerCase() !== next.email.toLowerCase()) await deleteLocalAccount(email);
        await saveLocalAccount({ ...account, ...next });
      }
      router.back();
    } catch {
      Alert.alert('Não foi possível guardar', 'Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}><ArrowLeft size={19} color={Palette.text} /></Pressable>
            <Text style={styles.title}>Editar perfil</Text>
          </View>
          <View style={styles.avatarCard}>
            <Pressable accessibilityRole="button" accessibilityLabel="Alterar foto de perfil" onPress={pickAvatar} style={styles.avatarWrap}>
              {avatar ? <Image source={{ uri: avatar }} style={styles.avatarImage} contentFit="cover" /> : <View style={styles.avatar}><Text style={styles.avatarText}>{editName.trim().charAt(0).toUpperCase() || 'U'}</Text></View>}
              <View style={styles.cameraBadge}><Camera size={14} color={Palette.surface} /></View>
            </Pressable>
            <Text style={styles.avatarHint}>Toque na fotografia para alterar</Text>
          </View>
          <View style={styles.form}>
            <TextField label="Nome completo" containerStyle={styles.field} accessibilityLabel="Nome completo" autoCapitalize="words" value={editName} onChangeText={setEditName} placeholder="O seu nome" />
            <TextField label="Email" containerStyle={styles.field} accessibilityLabel="Email" autoCapitalize="none" keyboardType="email-address" value={editEmail} onChangeText={setEditEmail} placeholder="nome@email.com" />
            <TextField label="Telefone" containerStyle={styles.field} accessibilityLabel="Telefone" autoCapitalize="none" keyboardType="phone-pad" value={editPhone} onChangeText={setEditPhone} placeholder="+244 900 000 000" />
            <Pressable accessibilityRole="button" disabled={!valid || saving} onPress={save} style={[styles.saveButton, (!valid || saving) && styles.saveButtonDisabled]}>
              <Text style={styles.saveButtonText}>{saving ? 'A GUARDAR…' : 'GUARDAR ALTERAÇÕES'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 35 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Palette.surface },
  title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 23, marginTop: 3 },
  avatarCard: { alignItems: 'center', paddingVertical: 22, borderRadius: 18, backgroundColor: Palette.surface },
  avatarWrap: { width: 96, height: 96 },
  avatar: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', borderRadius: 48, backgroundColor: Palette.softPink },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarText: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 34 },
  cameraBadge: { position: 'absolute', right: 0, bottom: 0, width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Palette.primary, borderWidth: 2, borderColor: Palette.surface },
  avatarHint: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 10 },
  form: { padding: 15, marginTop: 12, borderRadius: 17, backgroundColor: Palette.surface },
  field: { marginTop: 12 },
  saveButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 18, borderRadius: 13, backgroundColor: Palette.primary },
  saveButtonDisabled: { opacity: 0.45 },
  saveButtonText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 11, letterSpacing: 0.5 },
});
