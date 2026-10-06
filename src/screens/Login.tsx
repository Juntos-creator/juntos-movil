import React, { useState } from 'react';
import { Alert, Image, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { Screen, Field, BigButton, Txt } from '../ui';

export default function Login() {
  const [up, setUp] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || pass.length < 6 || (up && !name.trim())) {
      Alert.alert('Faltan datos', up ? 'Escriba su nombre, correo y una contraseña de al menos 6 letras o números.' : 'Escriba su correo y su contraseña.');
      return;
    }
    setBusy(true);
    try {
      if (!up) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
        if (error) Alert.alert('No pudimos entrar', 'Revise su correo y su contraseña e intente de nuevo.');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password: pass, options: { data: { full_name: name.trim(), phone: phone.trim() } },
        });
        if (error) Alert.alert('No pudimos crear su cuenta', error.message);
        else if (!data.session) Alert.alert('Revise su correo', 'Le enviamos un mensaje para confirmar su cuenta. Después vuelva aquí y entre.');
      }
    } finally { setBusy(false); }
  };

  return (
    <Screen title={up ? 'Crear mi cuenta' : 'Bienvenido a JUNTOS'} speakText="Bienvenido a JUNTOS. Cuando no puedes estar, estamos juntos. Escriba su correo y su contraseña para entrar.">
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Image source={require('../../assets/logo.png')} style={{ width: 150, height: 150 }} resizeMode="contain" accessibilityLabel="Logo de JUNTOS" />
        <Txt size={19} center>Cuando no puedes estar, estamos JUNTOS.</Txt>
      </View>
      {up ? (<>
        <Field label="Su nombre" value={name} onChangeText={setName} autoCapitalize="words" textContentType="name" />
        <Field label="Su WhatsApp o teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" textContentType="telephoneNumber" />
      </>) : null}
      <Field label="Su correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" />
      <Field label="Su contraseña" value={pass} onChangeText={setPass} secureTextEntry autoCapitalize="none" textContentType="password" />
      <BigButton kind="accent" icon={up ? '📝' : '🔑'} label={up ? 'Crear mi cuenta' : 'Entrar'} onPress={submit} loading={busy} />
      <BigButton kind="ghost" label={up ? 'Ya tengo cuenta' : 'No tengo cuenta'} onPress={() => setUp(!up)} />
      <Txt size={16} center>Las acompañantes se registran en la página web de JUNTOS, donde se verifican sus documentos.</Txt>
    </Screen>
  );
}
