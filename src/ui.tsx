import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, TextInputProps, StyleProp, ViewStyle, RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useA11y } from './a11y';

export function Txt({ size = 20, bold, color, center, style, children, ...rest }:
  { size?: number; bold?: boolean; color?: string; center?: boolean; style?: StyleProp<ViewStyle>; children: React.ReactNode; [k: string]: any }) {
  const { scale, p } = useA11y();
  return (
    <Text maxFontSizeMultiplier={1.3}
      style={[{ fontSize: size * scale, lineHeight: size * scale * 1.35, color: color ?? p.text, fontWeight: bold ? '700' : '400', textAlign: center ? 'center' : 'left' }, style as any]}
      {...rest}>{children}</Text>
  );
}

type Kind = 'primary' | 'accent' | 'danger' | 'ghost';
export function BigButton({ label, icon, onPress, kind = 'primary', hint, disabled, loading }:
  { label: string; icon?: string; onPress: () => void; kind?: Kind; hint?: string; disabled?: boolean; loading?: boolean }) {
  const { p } = useA11y();
  const bg = kind === 'primary' ? p.primary : kind === 'accent' ? p.accent : kind === 'danger' ? p.danger : p.card;
  const fg = kind === 'ghost' ? p.primary : p.onPrimary;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading} onPress={onPress}
      style={({ pressed }) => ({ minHeight: 68, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 12, marginBottom: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: bg,
        borderWidth: kind === 'ghost' ? p.borderW + 0.5 : 0, borderColor: p.primary,
        opacity: disabled ? 0.45 : pressed ? 0.8 : 1 })}>
      {loading ? <ActivityIndicator color={fg} size="large" /> : (
        <>
          {icon ? <Txt size={28} style={{ marginRight: 12 } as any}>{icon}</Txt> : null}
          <Txt size={22} bold color={fg} style={{ flexShrink: 1 } as any}>{label}</Txt>
        </>
      )}
    </Pressable>
  );
}

export function Option({ label, selected, onPress, sub }: { label: string; selected: boolean; onPress: () => void; sub?: string }) {
  const { p } = useA11y();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={label} onPress={onPress}
      style={{ minHeight: 64, borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center',
        backgroundColor: selected ? p.primary : p.card, borderWidth: p.borderW + (selected ? 1 : 0), borderColor: selected ? p.primary : p.border }}>
      <Txt size={26} style={{ marginRight: 12 } as any} color={selected ? '#fff' : p.primary}>{selected ? '✔' : '○'}</Txt>
      <View style={{ flex: 1 }}>
        <Txt size={21} bold color={selected ? '#fff' : p.text}>{label}</Txt>
        {sub ? <Txt size={17} color={selected ? '#fff' : p.muted}>{sub}</Txt> : null}
      </View>
    </Pressable>
  );
}

export function Card({ children, tone }: { children: React.ReactNode; tone?: 'warn' | 'ok' }) {
  const { p } = useA11y();
  return (
    <View style={{ backgroundColor: tone === 'warn' ? '#FEF3C7' : tone === 'ok' ? '#D1FAE5' : p.card, borderRadius: 18, padding: 16, marginBottom: 14,
      borderWidth: p.borderW, borderColor: p.border }}>{children}</View>
  );
}

export function Field({ label, ...rest }: { label: string } & TextInputProps) {
  const { p, scale } = useA11y();
  return (
    <View style={{ marginBottom: 14 }}>
      <Txt size={19} bold style={{ marginBottom: 6 } as any}>{label}</Txt>
      <TextInput accessibilityLabel={label} placeholderTextColor={p.muted} maxFontSizeMultiplier={1.3}
        style={{ minHeight: 62, borderRadius: 14, borderWidth: p.borderW + 0.5, borderColor: p.border, backgroundColor: '#fff',
          paddingHorizontal: 14, fontSize: 22 * scale, color: p.text }} {...rest} />
    </View>
  );
}

export function Screen({ title, onBack, speakText, children, refreshControl }:
  { title: string; onBack?: () => void; speakText?: string; children: React.ReactNode; refreshControl?: React.ReactElement<RefreshControlProps> }) {
  const { p, voice, speak } = useA11y();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 8 }}>
        {onBack ? <BigButton kind="ghost" icon="←" label="Volver" onPress={onBack} hint="Regresa a la pantalla anterior" /> : null}
        <Txt size={30} bold accessibilityRole="header" style={{ marginBottom: 8 } as any}>{title}</Txt>
        {voice ? <BigButton kind="ghost" icon="🔊" label="Escuchar esta pantalla" onPress={() => speak(speakText || title)} /> : null}
      </View>
      <ScrollView refreshControl={refreshControl} contentContainerStyle={{ padding: 18, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
