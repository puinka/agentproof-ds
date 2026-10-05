// Applies rebrand/<date>-spec.json to tokens/figma-variables.json and writes the PREDICTED export.
// Purpose: the code can be built and reviewed before the Figma bridge is back. After the Figma
// apply script runs, re-export from Figma: the real export must fingerprint-match this prediction.
// Usage: node rebrand/predict.mjs rebrand/2026-10-05-spec.json
import { readFileSync, writeFileSync } from 'node:fs';

const spec = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const path = 'tokens/figma-variables.json';
const d = JSON.parse(readFileSync(path, 'utf8'));
const col = (n) => d.collections.find((c) => c.name === n).vars;
const W = { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 };

const base = col('Base / Color');
for (const [prefix, ramp] of Object.entries(spec.setRamp))
  for (const [step, hex] of Object.entries(ramp)) base.find((v) => v[0] === `${prefix}/${step}`)[1] = hex;
for (const [prefix, ramp] of Object.entries(spec.addRamp))
  for (const [step, hex] of Object.entries(ramp)) if (!base.some((v) => v[0] === `${prefix}/${step}`)) base.push([`${prefix}/${step}`, hex]);

const sem = col('Semantic / Color');
for (const [n, v] of Object.entries({ ...spec.alias, ...spec.raw })) sem.find((x) => x[0] === n)[1] = v;
for (const [colName, vars] of Object.entries(spec.addAlias ?? {}))
  for (const [n, v] of Object.entries(vars)) { const c = col(colName); if (!c.some((x) => x[0] === n)) c.push([n, v]); }
const shape = col('Semantic / Shape');
for (const [n, v] of Object.entries(spec.shape)) shape.find((x) => x[0] === n)[1] = v;

d._textStyleColumns = ['name', 'family', 'weight', 'fontSizePx', 'lineHeightPx (null = auto)', 'letterSpacingPercent', 'textCase (null = original)'];
const rows = new Map(d.textStyles.map((r) => [r[0], r.length === 6 ? [...r, null] : r]));
for (const [from, to, family, style, size, lh, ls] of spec.textStyles) {
  const old = rows.get(from);
  if (!old) throw new Error(`text style not in export: ${from}`);
  rows.delete(from);
  rows.set(to, [to, family, W[style], size, lh, ls, old[6] ?? null]);
}
for (const [name, family, style, size, lh, ls, tc] of spec.newTextStyles) rows.set(name, [name, family, W[style], size, lh, ls, tc]);
d.textStyles = [...rows.values()];

for (const [name, map] of Object.entries(spec.effectColor)) {
  const e = d.effectStyles.find((x) => x[0] === name);
  e[1] = e[1].map((l) => [l[0], map[l[1]] ?? l[1], ...l.slice(2)]);
}
d._source = 'PREDICTED from ' + process.argv[2] + ' (not yet a Figma export). Replace with a real export after the Figma apply and compare fingerprints.';
writeFileSync(path, JSON.stringify(d, null, 1) + '\n');
console.log('predicted export written:', base.length, 'base,', sem.length, 'semantic,', d.textStyles.length, 'text styles');
