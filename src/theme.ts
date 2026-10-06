export const palette = (hc: boolean) => ({
  bg: hc ? '#FFFFFF' : '#F3F8FC',
  card: '#FFFFFF',
  text: hc ? '#000000' : '#0B1F2E',
  muted: hc ? '#1F2937' : '#41566A',
  primary: hc ? '#002B49' : '#0E3A5D',
  accent: hc ? '#065F46' : '#047857',
  danger: '#B91C1C',
  border: hc ? '#000000' : '#C9D8E4',
  borderW: hc ? 3 : 1.5,
  onPrimary: '#FFFFFF',
});
export type Palette = ReturnType<typeof palette>;
