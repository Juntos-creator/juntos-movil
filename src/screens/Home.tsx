import React from 'react';
import { Image, View } from 'react-native';
import { Ctx } from '../../App';
import { Screen, BigButton, Txt } from '../ui';

export default function Home({ profile, nav }: Ctx) {
  const first = String(profile.full_name || '').trim().split(' ')[0];
  const comp = profile.role === 'COMPANION';
  return (
    <Screen title={first ? `Hola, ${first}` : 'Hola'}
      speakText={comp ? 'Menú principal. Puede ver sus servicios, pedir ayuda o cambiar el tamaño de la letra.' : 'Menú principal. Puede pedir un acompañante, ver sus servicios, pedir ayuda o cambiar el tamaño de la letra.'}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Image source={require('../../assets/logo.png')} style={{ width: 110, height: 110 }} resizeMode="contain" accessibilityLabel="Logo de JUNTOS" />
        <Txt size={18} center>Cuando no puedes estar, estamos JUNTOS.</Txt>
      </View>
      {!comp ? <BigButton kind="accent" icon="🤝" label="Pedir un acompañante" hint="Abre el formulario paso a paso" onPress={() => nav.go('new')} /> : null}
      <BigButton icon="📋" label="Mis servicios" onPress={() => nav.go('services')} />
      <BigButton kind="danger" icon="🆘" label="Necesito ayuda" onPress={() => nav.go('help')} />
      <BigButton kind="ghost" icon="🔠" label="Letra, colores y voz" onPress={() => nav.go('settings')} />
    </Screen>
  );
}
