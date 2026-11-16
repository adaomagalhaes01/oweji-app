import { StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/palette';

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const score = Number(password.length >= 8)
    + Number(/[a-z]/.test(password) && /[A-Z]/.test(password))
    + Number(/[\d\W]/.test(password))
    + Number(password.length >= 12);
  const level = score >= 3 ? 3 : score >= 2 ? 2 : 1;
  const label = level === 3 ? 'Forte' : level === 2 ? 'Média' : 'Fraca';
  const color = level === 3 ? Palette.success : level === 2 ? Palette.warning : Palette.error;

  return (
    <View accessibilityLabel={`Força da senha: ${label.toLowerCase()}`} style={styles.container}>
      <View style={styles.track}>
        {[1, 2, 3].map((segment) => <View key={segment} style={[styles.segment, segment <= level && { backgroundColor: color }]} />)}
      </View>
      <Text style={[styles.label, { color }]}>Senha {label.toLowerCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 7 },
  track: { flexDirection: 'row', gap: 5 },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Palette.border },
  label: { fontFamily: 'Poppins_500Medium', fontSize: 9, marginTop: 4 },
});
