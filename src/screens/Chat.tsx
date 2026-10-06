import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ctx } from '../../App';
import { supabase } from '../lib/supabase';
import { useA11y } from '../a11y';
import { BigButton, Field, Txt } from '../ui';

export default function Chat({ user, profile, nav, id }: Ctx & { id: string }) {
  const { p } = useA11y();
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    let alive = true;
    supabase.from('service_messages').select('*').eq('service_request_id', id).order('created_at').then(({ data, error }) => {
      if (!alive) return;
      if (error) Alert.alert('Chat no disponible', 'No pudimos cargar los mensajes.'); else setMsgs(data ?? []);
    });
    const ch = supabase.channel(`chat-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'service_messages', filter: `service_request_id=eq.${id}` },
        (e) => setMsgs((cur) => (cur.some((m) => m.id === e.new.id) ? cur : [...cur, e.new])))
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [id]);

  useEffect(() => { setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 100); }, [msgs]);

  const send = async () => {
    const m = text.trim(); if (!m) return;
    setText('');
    const { data, error } = await supabase.from('service_messages')
      .insert({ service_request_id: id, sender_id: user.id, sender_name: profile.full_name || 'Usuario', message: m }).select().single();
    if (error) { setText(m); Alert.alert('No se envió', 'Intente otra vez.'); }
    else if (data) setMsgs((cur) => (cur.some((x) => x.id === data.id) ? cur : [...cur, data]));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: 18, paddingBottom: 0 }}>
          <BigButton kind="ghost" icon="←" label="Volver" onPress={nav.back} />
        </View>
        <ScrollView ref={ref} contentContainerStyle={{ padding: 18 }}>
          {msgs.length === 0 ? <Txt size={20}>Escriba el primer mensaje.</Txt> : null}
          {msgs.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <View key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', marginBottom: 10, padding: 14, borderRadius: 16,
                backgroundColor: mine ? p.primary : '#fff', borderWidth: p.borderW, borderColor: mine ? p.primary : p.border }}>
                {!mine ? <Txt size={16} bold color={p.accent}>{m.sender_name}</Txt> : null}
                <Txt size={21} color={mine ? '#fff' : p.text}>{m.message}</Txt>
              </View>
            );
          })}
        </ScrollView>
        <View style={{ padding: 18, paddingTop: 0 }}>
          <Field label="Su mensaje" value={text} onChangeText={setText} multiline />
          <BigButton kind="accent" icon="📤" label="Enviar" onPress={send} disabled={!text.trim()} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
