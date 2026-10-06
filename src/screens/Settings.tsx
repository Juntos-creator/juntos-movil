import React from 'react';
import { Ctx } from '../../App';
import { supabase } from '../lib/supabase';
import { useA11y } from '../a11y';
import { Screen, Option, BigButton, Txt } from '../ui';

export default function Settings({ nav }: Ctx) {
  const { scale, contrast, voice, set, speak } = useA11y();
  return (
    <Screen title="Letra, colores y voz" onBack={nav.back} speakText="Aquí puede hacer la letra más grande, usar colores de alto contraste y activar la voz.">
      <Txt size={22} bold style={{ marginBottom: 8 } as any}>Tamaño de la letra</Txt>
      <Option label="Normal" selected={scale === 1} onPress={() => set({ scale: 1 })} />
      <Option label="Grande" selected={scale === 1.15} onPress={() => set({ scale: 1.15 })} />
      <Option label="Muy grande" selected={scale === 1.4} onPress={() => set({ scale: 1.4 })} />
      <Txt size={22} bold style={{ marginVertical: 8 } as any}>Colores</Txt>
      <Option label="Colores normales" selected={!contrast} onPress={() => set({ contrast: false })} />
      <Option label="Alto contraste (negro sobre blanco)" selected={contrast} onPress={() => set({ contrast: true })} />
      <Txt size={22} bold style={{ marginVertical: 8 } as any}>Voz</Txt>
      <Option label="Mostrar botón “Escuchar”" selected={voice} onPress={() => set({ voice: true })} />
      <Option label="Ocultar botón “Escuchar”" selected={!voice} onPress={() => set({ voice: false })} />
      <BigButton kind="ghost" icon="🔊" label="Probar la voz" onPress={() => speak('Hola, así suena la voz de JUNTOS.')} />
      <BigButton kind="danger" icon="🚪" label="Cerrar sesión" onPress={() => supabase.auth.signOut()} />
    </Screen>
  );
}
