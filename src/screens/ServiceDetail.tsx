import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import * as Location from 'expo-location';
import { Ctx } from '../../App';
import { supabase } from '../lib/supabase';
import { statusOf, longDate } from '../lib/data';
import { Screen, Card, Txt, BigButton, Field } from '../ui';

export default function ServiceDetail({ user, profile, nav, id }: Ctx & { id: string }) {
  const comp = profile.role === 'COMPANION';
  const [r, setR] = useState<any>(null);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('service_requests').select('*').eq('id', id).maybeSingle();
    setR(data);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (!r) return <Screen title="Detalle" onBack={nav.back}><Txt size={20}>Cargando…</Txt></Screen>;
  const st = String(r.status ?? '').toLowerCase();
  const s = statusOf(st);
  const pinIn = r.checkin_pin || r.pin_start;
  const pinOut = r.checkout_pin || r.pin_end;

  const gps = async () => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') return null;
      const pos = await Location.getCurrentPositionAsync({});
      return `[GPS: ${pos.coords.latitude}, ${pos.coords.longitude}]`;
    } catch { return null; }
  };

  const confirm = async (kind: 'in' | 'out') => {
    const expected = String((kind === 'in' ? pinIn : pinOut) ?? '').trim();
    if (!expected || pin.trim() !== expected) { Alert.alert('Código incorrecto', 'Pida el código a la persona, en persona.'); return; }
    setBusy(true);
    const loc = await gps();
    const now = new Date().toISOString();
    const patch = kind === 'in'
      ? { status: 'in_progress', started_at: now, ...(loc ? { checkin_location: loc } : {}) }
      : { status: 'completed', completed_at: now, ...(loc ? { checkout_location: loc } : {}) };
    const { error } = await supabase.from('service_requests').update(patch).eq('id', id);
    if (!error) await supabase.from('audit_logs').insert({ user_id: user.id, action: kind === 'in' ? 'SERVICE_CHECKIN_VALIDATED' : 'SERVICE_CHECKOUT_VALIDATED', details: { service_id: id, location: loc } });
    setBusy(false); setPin('');
    if (error) Alert.alert('No se pudo guardar', 'Intente otra vez.'); else load();
  };

  const rate = async () => {
    setBusy(true);
    const { error } = await supabase.from('service_reviews').insert({ service_request_id: id, client_id: user.id, companion_id: r.companion_id, rating: stars, comment: comment.trim() || null });
    if (!error) await supabase.from('service_requests').update({ rating: stars, review_comment: comment.trim() || null }).eq('id', id);
    setBusy(false);
    if (error) Alert.alert('No se pudo enviar', 'Intente otra vez.'); else { Alert.alert('¡Gracias!', 'Su opinión nos ayuda a mejorar.'); load(); }
  };

  return (
    <Screen title={`${s.icon} ${s.label}`} onBack={nav.back}
      speakText={`${s.label}. ${r.service_type}. ${r.requested_date ? longDate(r.requested_date) : ''}. ${r.center_name ?? ''}`}>
      <Card>
        <Txt size={21} bold>{r.service_type}</Txt>
        <Txt size={20}>📅 {r.requested_date ? longDate(r.requested_date) : ''}, {String(r.requested_time ?? '').slice(0, 5)}</Txt>
        <Txt size={20}>🏥 {r.center_name}</Txt>
        {r.for_who_name ? <Txt size={20}>👤 {r.for_who_name}</Txt> : null}
        {r.observations ? <Txt size={19}>📝 {r.observations}</Txt> : null}
        <Txt size={16}>{r.code}</Txt>
      </Card>

      {!comp && (st === 'assigned' || st === 'in_progress') ? (
        <Card tone="warn">
          <Txt size={20} bold>Códigos de seguridad</Txt>
          <Txt size={19}>Dígaselos a su acompañante solo cuando esté con usted.</Txt>
          <Txt size={24} bold>Llegada: {pinIn || '—'}</Txt>
          <Txt size={24} bold>Salida: {pinOut || '—'}</Txt>
        </Card>
      ) : null}

      {comp && (st === 'assigned' || st === 'in_progress') ? (
        <Card>
          <Txt size={20} bold>{st === 'assigned' ? 'Confirmar llegada' : 'Confirmar salida'}</Txt>
          <Field label="Código que le da la persona" value={pin} onChangeText={setPin} keyboardType="number-pad" maxLength={8} />
          <BigButton kind="accent" icon="📍" label={st === 'assigned' ? 'Ya llegué' : 'Terminar servicio'} onPress={() => confirm(st === 'assigned' ? 'in' : 'out')} loading={busy} disabled={!pin.trim()} />
        </Card>
      ) : null}

      {st !== 'submitted' && st !== 'cancelled' ? <BigButton icon="💬" label="Chat con la otra persona" onPress={() => nav.go('chat', { id })} /> : null}

      {!comp && st === 'completed' && !r.rating ? (
        <Card>
          <Txt size={21} bold>¿Cómo le fue?</Txt>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} estrellas`} onPress={() => setStars(n)} style={{ padding: 6 }}>
                <Txt size={40}>{n <= stars ? '⭐' : '☆'}</Txt>
              </Pressable>
            ))}
          </View>
          <Field label="Comentario (opcional)" value={comment} onChangeText={setComment} multiline />
          <BigButton kind="accent" label="Enviar mi opinión" onPress={rate} disabled={!stars} loading={busy} />
        </Card>
      ) : null}
    </Screen>
  );
}
