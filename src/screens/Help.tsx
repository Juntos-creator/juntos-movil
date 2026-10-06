import React, { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { Ctx } from '../../App';
import { supabase } from '../lib/supabase';
import { SUPPORT_EMAIL } from '../lib/data';
import { Screen, BigButton, Card, Txt } from '../ui';

export default function Help({ user, profile, nav }: Ctx) {
  const [contact, setContact] = useState<{ name: string; phone: string } | null>(null);
  useEffect(() => {
    if (profile.role !== 'CUSTOMER') return;
    supabase.from('service_requests').select('emergency_contact_name, emergency_contact_phone').eq('customer_id', user.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (data?.emergency_contact_phone) setContact({ name: data.emergency_contact_name, phone: data.emergency_contact_phone }); });
  }, [profile.role, user.id]);

  const call = (num: string, who: string) =>
    Alert.alert(`¿Llamar a ${who}?`, num, [{ text: 'No', style: 'cancel' }, { text: 'Sí, llamar', onPress: () => Linking.openURL(`tel:${num.replace(/[^\d+]/g, '')}`) }]);

  return (
    <Screen title="Necesito ayuda" onBack={nav.back} speakText="Si es una emergencia médica, llame al 911. También puede llamar a su contacto de confianza o escribirnos.">
      <Card tone="warn"><Txt size={20} bold>Si es una emergencia médica, llame al 911.</Txt><Txt size={18}>JUNTOS acompaña a las personas pero no es un servicio médico ni de ambulancia.</Txt></Card>
      <BigButton kind="danger" icon="🚑" label="Llamar al 911" onPress={() => call('911', 'emergencias (911)')} />
      {contact ? <BigButton icon="📞" label={`Llamar a ${contact.name}`} onPress={() => call(contact.phone, contact.name)} /> : null}
      <BigButton kind="ghost" icon="✉️" label="Escribir a JUNTOS" hint={SUPPORT_EMAIL} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} />
    </Screen>
  );
}
