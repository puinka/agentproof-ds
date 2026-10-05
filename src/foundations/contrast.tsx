import tokens from '../../tokens/figma-variables.json';

// Contrast computed at render time from the token export, so docs can't drift from Figma.
type Pair = [string, string | number];
const all = new Map<string, string>();
for (const c of tokens.collections) for (const [n, v] of c.vars as Pair[]) all.set(n, String(v));
export const resolve = (name: string): string => {
  let v = all.get(name);
  while (v && v.startsWith('@')) v = all.get(v.slice(1));
  if (!v) throw new Error(`Unknown token ${name}`);
  return v.slice(0, 7);
};
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const ratio = (fg: string, bg: string) => {
  const [a, b] = [lum(fg), lum(bg)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
type Layer = [string, string, number, number, number, number];
const focusLayers = (tokens.effectStyles as unknown as [string, Layer[]][]).find(([n]) => n === 'Focus State')![1];
const focusRing = focusLayers.find((l) => l[1] !== '#ffffff' && l[1].length === 7)![1];

export interface Row { label: string; fg: string; bg: string; need: number | null; criterion: string }

export function ContrastTable({ rows }: { rows: Row[] }) {
  return (
    <table>
      <thead><tr><th>Requirement</th><th>Pair</th><th>Ratio</th><th>WCAG</th></tr></thead>
      <tbody>
        {rows.map((r) => {
          const fg = r.fg === 'focus-ring' ? focusRing : resolve(r.fg);
          const v = ratio(fg, resolve(r.bg));
          const ok = r.need === null || v >= r.need;
          return (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td><code>{r.fg === 'focus-ring' ? `Focus State ring ${focusRing}` : r.fg}</code> on <code>{r.bg}</code></td>
              <td style={{ textAlign: 'right' }}>{v.toFixed(2)}:1</td>
              <td>{r.need === null ? `${r.criterion} exempt` : `${r.criterion} ${ok ? '✓' : '✗ fails'}`}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
