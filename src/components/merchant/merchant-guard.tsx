import { router } from 'expo-router';
import { ArrowLeft, Store } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';
import { goBackOr } from '@/features/merchant/navigation';

export function MerchantRestricted() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => goBackOr('/profile')} style={styles.back}>
          <ArrowLeft size={20} color={Palette.text} />
        </Pressable>
        <View style={styles.content}>
          <View style={styles.icon}><Store size={28} color={Palette.primaryDark} /></View>
          <Text style={styles.title}>Área do comerciante</Text>
          <Text style={styles.text}>Esta conta está registada como cliente. Crie uma conta de comerciante para publicar produtos e acompanhar as vendas da sua loja.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/register')} style={styles.primaryCTA}>
            <Text style={styles.primaryCTAText}>CRIAR CONTA DE COMERCIANTE</Text>
          </Pressable>
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
  title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 20, marginTop: 16, textAlign: 'center' },
  text: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  primaryCTA: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginTop: 20, borderRadius: 14, backgroundColor: Palette.primary },
  primaryCTAText: { color: Palette.surface, fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 0.4 },
  link: { color: Palette.primaryDark, fontFamily: 'Poppins_600SemiBold', fontSize: 11, marginTop: 14 },
});
