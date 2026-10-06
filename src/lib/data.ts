export const HOURLY_RATE = 900;   // RD$ por hora (igual que la plataforma web)
export const ITBIS_RATE = 0.18;
export const MIN_HOURS = 2;
export const SUPPORT_EMAIL = 'soporte@juntos.do';

export const CENTERS: { name: string; lat: number | null; lng: number | null }[] = [
  { name: 'CEDIMAT', lat: 18.4631, lng: -69.9389 },
  { name: 'Hospital General Plaza de la Salud', lat: 18.4760, lng: -69.9387 },
  { name: 'Clínica Abreu', lat: 18.4555, lng: -69.9099 },
  { name: 'Clínica Corazones Unidos', lat: 18.4710, lng: -69.9290 },
  { name: 'Hospiten Santo Domingo', lat: 18.4890, lng: -69.8570 },
  { name: 'Centro Médico Real', lat: 18.4820, lng: -69.9360 },
  { name: 'HOMS Santiago', lat: 19.4517, lng: -70.6970 },
  { name: 'Otro centro', lat: null, lng: null },
];

export const SERVICE_TYPES = [
  'Acompañamiento a consulta médica',
  'Acompañamiento a procedimiento ambulatorio',
  'Acompañamiento a estudios / laboratorio',
  'Acompañamiento post-alta',
  'Acompañamiento a adulto mayor',
];

export const money = (n: number) => 'RD$ ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const breakdown = (hours: number) => {
  const subtotal = HOURLY_RATE * hours;
  const itbis = Math.round(subtotal * ITBIS_RATE * 100) / 100;
  return { subtotal, itbis, total: subtotal + itbis };
};

export const STATUS: Record<string, { label: string; icon: string }> = {
  submitted: { label: 'Solicitud enviada', icon: '📨' },
  assigned: { label: 'Acompañante asignada', icon: '👩‍🦳' },
  in_progress: { label: 'En curso', icon: '🚶' },
  completed: { label: 'Terminado', icon: '✅' },
  cancelled: { label: 'Cancelado', icon: '✖️' },
};
export const statusOf = (s?: string | null) => STATUS[String(s ?? '').toLowerCase()] ?? { label: String(s ?? ''), icon: 'ℹ️' };

export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const longDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' });
};
export const hourLabel = (h: number) =>
  h === 12 ? '12:00 del mediodía' : h < 12 ? `${h}:00 de la mañana` : `${h - 12}:00 de la tarde`;
