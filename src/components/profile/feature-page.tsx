import { router } from 'expo-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/palette';

export type FeatureSection = { title: string; body: string; points?: string[] };
export function ProfileFeaturePage({ title, eyebrow = 'A MINHA CONTA', intro, sections }: { title: string; eyebrow?: string; intro: string; sections: FeatureSection[] }) {
  return <SafeAreaView edges={['top']} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar ao perfil" onPress={() => router.back()} style={styles.back}><ArrowLeft size={19} color={Palette.text} /></Pressable><View><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text></View></View>
    <Text style={styles.intro}>{intro}</Text>
    {sections.map((section) => <View key={section.title} style={styles.card}><Text style={styles.sectionTitle}>{section.title}</Text><Text style={styles.body}>{section.body}</Text>{section.points?.map((point) => <View key={point} style={styles.point}><CheckCircle2 size={15} color={Palette.primaryDark} /><Text style={styles.pointText}>{point}</Text></View>)}</View>)}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: Palette.background }, content: { padding: 20, paddingBottom: 34 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 13 }, back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Palette.surface }, eyebrow: { color: Palette.primaryDark, fontFamily: 'Poppins_700Bold', fontSize: 8, letterSpacing: 1.5 }, title: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 22, marginTop: 3 }, intro: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 11, lineHeight: 18, marginBottom: 15 }, card: { padding: 15, marginBottom: 11, borderRadius: 17, backgroundColor: Palette.surface }, sectionTitle: { color: Palette.text, fontFamily: 'Poppins_700Bold', fontSize: 12, marginBottom: 5 }, body: { color: Palette.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 10, lineHeight: 16 }, point: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10 }, pointText: { flex: 1, color: Palette.text, fontFamily: 'Poppins_500Medium', fontSize: 10, lineHeight: 15 } });
