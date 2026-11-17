import { router } from 'expo-router';
import { ArrowLeft, Clock3, Store } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { goBackOr } from '@/features/merchant/navigation';

export function MerchantRestricted({ status }: { status?: 'pending' | 'rejected' }) {
  const isPending = status === 'pending';
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => goBackOr('/profile')} style={styles.back}>
          <ArrowLeft size={20} color={Palette.text} />
        </Pressable>
        <View style={styles.content}>
          <View style={styles.icon}>{status ? <Clock3 size={28} color={Palette.primaryDark} /> : <Store size={28} color={Palette.primaryDark} />}</View>
          <Text style={styles.title}>{isPending ? 'Loja pendente de aprovação' : status === 'rejected' ? 'Loja não aprovada' : 'Área do comerciante'}</Text>
          <Text style={styles.text}>{isPending ? 'A sua loja está em análise por um administrador. Poderá publicar produtos e acompanhar as vendas após a aprovação.' : status === 'rejected' ? 'A sua loja não foi aprovada. Contacte o suporte OWEJI para mais informações.' : 'Esta conta está registada como cliente. Crie uma conta de comerciante para publicar produtos e acompanhar as vendas da sua loja.'}</Text>
          {!status ? <Pressable accessibilityRole="button" onPress={() => router.replace('/register')} style={styles.primaryCTA}>
            <Text style={styles.primaryCTAText}>CRIAR CONTA DE COMERCIANTE</Text>
          </Pressable> : null}
          <Pressable accessibilityRole="button" onPress={() => router.replace('/profile')}>
            <Text style={styles.link}>Voltar ao perfil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.background },
  wrap: { flexGrow: 1, padding: 20 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Palette.surface },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  icon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32, backgroundColor: Palette.softPink },
  title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 22, marginTop: 16, textAlign: 'center' },
  text: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  primaryCTA: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginTop: 20, borderRadius: 14, backgroundColor: Palette.primary },
  primaryCTAText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 13, letterSpacing: 0.4 },
  link: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 14, marginTop: 14 },
});
