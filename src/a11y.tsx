import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { palette, Palette } from './theme';

type Prefs = { scale: number; contrast: boolean; voice: boolean };
type Ctx = Prefs & { p: Palette; set: (x: Partial<Prefs>) => void; speak: (t: string) => void };
const DEF: Prefs = { scale: 1.15, contrast: false, voice: true };
const KEY = 'juntos.prefs';
const A11yCtx = createContext<Ctx>({ ...DEF, p: palette(false), set: () => {}, speak: () => {} });
export const useA11y = () => useContext(A11yCtx);

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEF);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { if (v) setPrefs({ ...DEF, ...JSON.parse(v) }); }).catch(() => {});
  }, []);
  const set = useCallback((x: Partial<Prefs>) => {
    setPrefs((cur) => { const n = { ...cur, ...x }; AsyncStorage.setItem(KEY, JSON.stringify(n)).catch(() => {}); return n; });
  }, []);
  const speak = useCallback((t: string) => {
    Speech.stop();
    Speech.speak(t, { language: 'es-MX', rate: 0.85 });
  }, []);
  return <A11yCtx.Provider value={{ ...prefs, p: palette(prefs.contrast), set, speak }}>{children}</A11yCtx.Provider>;
}
