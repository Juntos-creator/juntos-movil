import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, View } from 'react-native';
import { Ctx } from '../../App';
import { supabase } from '../lib/supabase';
import { CENTERS, SERVICE_TYPES, MIN_HOURS, breakdown, money, isoDate, longDate, hourLabel } from '../lib/data';
import { Screen, BigButton, Option, Field, Card, Txt } from '../ui';

const TOTAL = 9;
const TITLES = [
  '¿Para quién es el servicio?', '¿Qué necesita?', '¿Qué día?', '¿A qué hora?', '¿Cuántas horas?',
  '¿A qué centro de salud?', '¿Algo que debamos saber?', '¿A quién avisamos si hay algo urgente?', 'Revise y confirme',
];

export default function Wizard({ user, nav }: Ctx) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [f, setF] = useState({ who: 'me', whoName: '', type: '', date: '', time: '', hours: MIN_HOURS, center: '', other: '', obs: '', ecName: '', ecPhone: '', ecRel: '' });
  const set = (x: Partial<typeof f>) => setF((c) => ({ ...c, ...x }));

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 0 && !done) { setStep(step - 1); return true; }
      return false;
    });
    return () => sub.remove();
  }, [step, done]);

  const valid = [
    f.who === 'me' || !!f.whoName.trim(), !!f.type, !!f.date, !!f.time, f.hours >= MIN_HOURS,
    !!f.center && (f.center !== 'Otro centro' || !!f.other.trim()), true,
    !!f.ecName.trim() && !!f.ecPhone.trim() && !!f.ecRel.trim(), true,
  ][step];

  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return isoDate(d); });
  const b = breakdown(f.hours);
  const centerName = f.center === 'Otro centro' ? f.other.trim() : f.center;

  const submit = async () => {
    setBusy(true);
    try {
      const c = CENTERS.find((x) => x.name === f.center);
      const { data, error } = await supabase.from('service_requests').insert({
        customer_id: user.id, for_who: f.who, for_who_name: f.who === 'me' ? null : f.whoName.trim(),
        service_type: f.type, requested_date: f.date, requested_time: f.time, duration_minutes: f.hours * 60,
        center_name: centerName, target_lat: c?.lat ?? null, target_lng: c?.lng ?? null,
        observations: f.obs.trim() || null, emergency_contact_name: f.ecName.trim(),
        emergency_contact_phone: f.ecPhone.trim(), emergency_contact_relationship: f.ecRel.trim(), status: 'submitted',
      }).select('id, code').single();
      if (error || !data) throw error ?? new Error('sin datos');
      await supabase.from('payments').insert({
        service_request_id: data.id, customer_id: user.id, amount: b.total, currency: 'DOP', status: 'PENDING', provider: 'CONFIG_REQUIRED',
      });
      setDone(data.code ?? '');
    } catch {
      Alert.alert('No se pudo enviar', 'Revise su conexión a internet e intente otra vez. Sus datos siguen aquí.');
    } finally { setBusy(false); }
  };

  if (done !== null) {
    return (
      <Screen title="¡Solicitud enviada!" speakText="Su solicitud fue enviada. Le avisaremos cuando asignemos a su acompañante.">
        <Card tone="ok">
          <Txt size={22} bold>Su número de solicitud</Txt>
          <Txt size={30} bold>{done || '—'}</Txt>
          <Txt size={19}>Le avisaremos cuando asignemos a su acompañante. Puede ver el avance en “Mis servicios”.</Txt>
        </Card>
        <BigButton kind="accent" icon="📋" label="Ver mis servicios" onPress={() => { nav.home(); nav.go('services'); }} />
        <BigButton kind="ghost" label="Ir al inicio" onPress={nav.home} />
      </Screen>
    );
  }

  const speak = `Paso ${step + 1} de ${TOTAL}. ${TITLES[step]}`;
  return (
    <Screen title={`Paso ${step + 1} de ${TOTAL}`} speakText={speak} onBack={() => (step === 0 ? nav.back() : setStep(step - 1))}>
      <Txt size={26} bold style={{ marginBottom: 14 } as any}>{TITLES[step]}</Txt>

      {step === 0 && (<>
        <Option label="Para mí" selected={f.who === 'me'} onPress={() => set({ who: 'me' })} />
        <Option label="Para un familiar" selected={f.who === 'familiar'} onPress={() => set({ who: 'familiar' })} />
        <Option label="Para otra persona" selected={f.who === 'otro'} onPress={() => set({ who: 'otro' })} />
        {f.who !== 'me' ? <Field label="Nombre de la persona" value={f.whoName} onChangeText={(t) => set({ whoName: t })} autoCapitalize="words" /> : null}
      </>)}

      {step === 1 && SERVICE_TYPES.map((t) => <Option key={t} label={t} selected={f.type === t} onPress={() => set({ type: t })} />)}

      {step === 2 && days.map((d, i) => (
        <Option key={d} label={i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : longDate(d)} sub={i < 2 ? longDate(d) : undefined} selected={f.date === d} onPress={() => set({ date: d })} />
      ))}

      {step === 3 && (<>
        <Txt size={18} color="#41566A" style={{ marginBottom: 10 } as any}>Atendemos todos los días, de 7:00 de la mañana a 7:00 de la tarde.</Txt>
        {Array.from({ length: 12 }, (_, i) => i + 7).map((h) => {
          const v = `${String(h).padStart(2, '0')}:00`;
          return <Option key={v} label={hourLabel(h)} selected={f.time === v} onPress={() => set({ time: v })} />;
        })}
      </>)}

      {step === 4 && (<>
        <Txt size={18} color="#41566A" style={{ marginBottom: 10 } as any}>Mínimo {MIN_HOURS} horas. Cada hora cuesta {money(breakdown(1).subtotal)}.</Txt>
        {[2, 3, 4, 5, 6].map((h) => <Option key={h} label={`${h} horas`} sub={`${money(breakdown(h).subtotal)} + ITBIS`} selected={f.hours === h} onPress={() => set({ hours: h })} />)}
      </>)}

      {step === 5 && (<>
        {CENTERS.map((c) => <Option key={c.name} label={c.name} selected={f.center === c.name} onPress={() => set({ center: c.name })} />)}
        {f.center === 'Otro centro' ? <Field label="Nombre del centro o dirección" value={f.other} onChangeText={(t) => set({ other: t })} /> : null}
      </>)}

      {step === 6 && (<>
        <Txt size={19} style={{ marginBottom: 10 } as any}>Por ejemplo: usa bastón, necesita silla de ruedas, no oye bien. Es opcional. Por favor no escriba datos médicos privados.</Txt>
        <Field label="Observaciones (opcional)" value={f.obs} onChangeText={(t) => set({ obs: t })} multiline maxLength={1000} style={{ minHeight: 140, textAlignVertical: 'top' } as any} />
      </>)}

      {step === 7 && (<>
        <Field label="Nombre del contacto" value={f.ecName} onChangeText={(t) => set({ ecName: t })} autoCapitalize="words" />
        <Field label="WhatsApp o teléfono" value={f.ecPhone} onChangeText={(t) => set({ ecPhone: t })} keyboardType="phone-pad" />
        <Field label="Parentesco (hija, hijo, vecina…)" value={f.ecRel} onChangeText={(t) => set({ ecRel: t })} />
      </>)}

      {step === 8 && (<>
        <Card>
          <Txt size={20}>👤 {f.who === 'me' ? 'Para usted' : f.whoName}</Txt>
          <Txt size={20}>🩺 {f.type}</Txt>
          <Txt size={20}>📅 {f.date ? longDate(f.date) : ''}, {f.time ? hourLabel(Number(f.time.slice(0, 2))) : ''}</Txt>
          <Txt size={20}>⏱️ {f.hours} horas</Txt>
          <Txt size={20}>🏥 {centerName}</Txt>
          <Txt size={20}>📞 {f.ecName} ({f.ecRel}) {f.ecPhone}</Txt>
        </Card>
        <Card tone="warn">
          <Txt size={19}>Subtotal: {money(b.subtotal)}</Txt>
          <Txt size={19}>ITBIS 18%: {money(b.itbis)}</Txt>
          <Txt size={26} bold>Total: {money(b.total)}</Txt>
          <Txt size={17}>El pago se coordina cuando asignemos a su acompañante. JUNTOS acompaña a las personas; no da atención médica.</Txt>
        </Card>
      </>)}

      <View style={{ height: 8 }} />
      {step < TOTAL - 1
        ? <BigButton kind="accent" icon="➡️" label="Siguiente" onPress={() => setStep(step + 1)} disabled={!valid} hint={valid ? undefined : 'Elija una opción para continuar'} />
        : <BigButton kind="accent" icon="✅" label="Confirmar y enviar" onPress={submit} loading={busy} />}
    </Screen>
  );
}
