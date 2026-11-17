import { Eye, EyeOff } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/palette';

export const fieldTheme = StyleSheet.create({
  label: { color: Palette.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12, marginBottom: 6 },
  wrap: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#F4F1F2', borderWidth: 1.5, borderColor: '#F4F1F2' },
  wrapFocused: { borderColor: Palette.primary },
  wrapMultiline: { alignItems: 'flex-start', paddingTop: 14 },
  input: { flex: 1, color: Palette.text, fontFamily: 'Poppins_400Regular', fontSize: 14, paddingVertical: 0 },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
});

export function useFieldFocus() {
  const [focused, setFocused] = useState(false);
  return {
    focused,
    focusProps: {
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    },
  };
}

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  toggle?: () => void;
  visible?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  wrapStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function TextField({ label, icon, trailing, toggle, visible, containerStyle, wrapStyle, inputStyle, labelStyle, multiline, onFocus, onBlur, ...props }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={containerStyle}>
      {label ? <Text style={[fieldTheme.label, labelStyle]}>{label}</Text> : null}
      <View style={[fieldTheme.wrap, multiline && fieldTheme.wrapMultiline, focused && fieldTheme.wrapFocused, wrapStyle]}>
        {icon}
        <TextInput
          {...props}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          placeholderTextColor={props.placeholderTextColor ?? Palette.textSecondary}
          style={[fieldTheme.input, multiline && fieldTheme.inputMultiline, inputStyle]}
        />
        {toggle ? <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={toggle} hitSlop={8}>{visible ? <EyeOff size={18} color={Palette.textSecondary} /> : <Eye size={18} color={Palette.textSecondary} />}</Pressable> : null}
        {trailing}
      </View>
    </View>
  );
}
