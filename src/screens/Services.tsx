import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { Ctx } from '../../App';
import { supabase } from '../lib/supabase';
import { statusOf, longDate } from '../lib/data';
import { Screen, Card, Txt, BigButton } from '../ui';
import { useA11y } from '../a11y';

export default function Services({ user, profile, nav }: Ctx) {
  const { p } = useA11y();
  const [rows, setRows] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const col = profile.role === 'COMPANION' ? 'companion_id' : 'customer_id';

  const load = useCallback(async () => {
    setBusy(true); setErr(false);
    const { data, error } = await supabase.from('service_requests')
      .select('id, code, service_type, requested_date, requested_time, center_name, status')
      .eq(col, user.id).order('created_at', { ascending: false });
    if (error) setErr(true); else setRows(data ?? []);
    setBusy(false);
  }, [col, user.id]);
  useEffect(() => { load(); }, [load]);

  return (
    <Screen title="Mis servicios" onBack={nav.back} speakText="Estos son sus servicios. Toque uno para ver los detalles."
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}>
      {err ? <Card tone="warn"><Txt size={20}>No pudimos cargar sus servicios. Jale la pantalla hacia abajo para intentar de nuevo.</Txt></Card> : null}
      {rows && rows.length === 0 ? <Card><Txt size={21}>Todavía no tiene servicios.</Txt></Card> : null}
      {(rows ?? []).map((r) => {
        const s = statusOf(r.status);
        return (
          <Pressable key={r.id} accessibilityRole="button" accessibilityLabel={`${r.service_type}, ${s.label}, ${r.requested_date ? longDate(r.requested_date) : ''}`}
            onPress={() => nav.go('detail', { id: r.id })}>
            <Card>
              <Txt size={22} bold>{s.icon} {s.label}</Txt>
              <Txt size={20}>{r.service_type}</Txt>
              <Txt size={19} color={p.muted}>{r.requested_date ? longDate(r.requested_date) : ''} · {String(r.requested_time ?? '').slice(0, 5)}</Txt>
              <Txt size={19} color={p.muted}>{r.center_name}</Txt>
              <Txt size={16} color={p.muted}>{r.code}</Txt>
            </Card>
          </Pressable>
        );
      })}
      <BigButton kind="ghost" icon="🔄" label="Actualizar" onPress={load} />
    </Screen>
  );
}
