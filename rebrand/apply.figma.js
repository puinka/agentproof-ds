// Figma apply for a brand refresh spec. Run through Console MCP `figma_execute` on the WORKING COPY only.
// The runner prepends `const SPEC = <rebrand/<date>-spec.json>;` and `const STEP = 'snapshot' | 'variables' | 'styles';`.
// Each step is idempotent: running it twice gives the same file.
const EXPECTED_FILE = 'Agentproof DS';
if (figma.root.name !== EXPECTED_FILE) return { stop: figma.root.name };

const rgba = (hex) => {
  const h = hex.replace('#', '');
  const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
};
const same = (a, b) => ['r', 'g', 'b', 'a'].every((k) => Math.abs((a[k] ?? 1) - (b[k] ?? 1)) < 0.002);

if (STEP === 'snapshot') {
  const v = await figma.saveVersionHistoryAsync('Before brand refresh 2026-10-05', 'Indigo + lime, Outfit/Manrope, radii 16/24. Next: cobalt + ink, Geist, radii 4/8.');
  return { saved: v.id };
}

if (STEP === 'variables') {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const byName = (col, name) => vars.find((v) => v.variableCollectionId === col.id && v.name === name);
  const col = (n) => cols.find((c) => c.name === n);
  const baseC = col('Base / Color'), semC = col('Semantic / Color'), radC = col('Base / Radius'), shapeC = col('Semantic / Shape');
  const log = { set: 0, created: 0, aliased: 0, raw: 0, shape: 0 };

  for (const [prefix, ramp] of Object.entries(SPEC.setRamp))
    for (const [step, hex] of Object.entries(ramp)) {
      const v = byName(baseC, `${prefix}/${step}`);
      if (!v) throw new Error('missing ' + prefix + '/' + step);
      v.setValueForMode(baseC.defaultModeId, rgba(hex)); log.set++;
    }
  for (const [prefix, ramp] of Object.entries(SPEC.addRamp))
    for (const [step, hex] of Object.entries(ramp)) {
      let v = byName(baseC, `${prefix}/${step}`);
      if (!v) {
        v = figma.variables.createVariable(`${prefix}/${step}`, baseC, 'COLOR');
        const twin = byName(baseC, `color/slate/${step}`); // copy scopes and publishing from the ramp it replaces
        if (twin) { v.scopes = twin.scopes; v.hiddenFromPublishing = twin.hiddenFromPublishing; }
        vars.push(v); log.created++;
      }
      v.setValueForMode(baseC.defaultModeId, rgba(hex));
    }
  for (const [n, target] of Object.entries(SPEC.alias)) {
    const v = byName(semC, n), t = byName(baseC, target.slice(1));
    if (!v || !t) throw new Error('alias ' + n + ' -> ' + target);
    v.setValueForMode(semC.defaultModeId, figma.variables.createVariableAlias(t)); log.aliased++;
  }
  for (const [n, hex] of Object.entries(SPEC.raw)) { byName(semC, n).setValueForMode(semC.defaultModeId, rgba(hex)); log.raw++; }
  // New aliases (e.g. role sizes): FLOAT variables that point at a base step.
  for (const [colName, list] of Object.entries(SPEC.addAlias ?? {})) {
    const c = col(colName);
    for (const [n, target] of Object.entries(list)) {
      const t = vars.find((v) => v.name === target.slice(1));
      let v = byName(c, n);
      if (!v) { v = figma.variables.createVariable(n, c, 'FLOAT'); v.scopes = ['WIDTH_HEIGHT', 'GAP']; vars.push(v); log.created++; }
      v.setValueForMode(c.defaultModeId, figma.variables.createVariableAlias(t));
    }
  }
  for (const [n, target] of Object.entries(SPEC.shape)) {
    const v = byName(shapeC, n), t = byName(radC, target.slice(1));
    v.setValueForMode(shapeC.defaultModeId, figma.variables.createVariableAlias(t)); log.shape++;
  }
  return log;
}

if (STEP === 'styles') {
  const fams = [...new Set([...SPEC.textStyles.map((r) => r[2] + '|' + r[3]), ...SPEC.newTextStyles.map((r) => r[1] + '|' + r[2])])];
  for (const f of fams) { const [family, style] = f.split('|'); await figma.loadFontAsync({ family, style }); }
  const styles = await figma.getLocalTextStylesAsync();
  const log = { updated: [], created: [], missing: [] };
  const apply = (s, family, style, size, lh, ls, tc) => {
    s.fontName = { family, style };
    s.fontSize = size;
    s.lineHeight = lh == null ? { unit: 'AUTO' } : { unit: 'PIXELS', value: lh };
    s.letterSpacing = { unit: 'PERCENT', value: ls };
    if (tc) s.textCase = tc;
  };
  for (const [from, to, family, style, size, lh, ls] of SPEC.textStyles) {
    const s = styles.find((x) => x.name === from) || styles.find((x) => x.name === to);
    if (!s) { log.missing.push(from); continue; }
    apply(s, family, style, size, lh, ls); s.name = to; log.updated.push(to);
  }
  for (const [name, family, style, size, lh, ls, tc] of SPEC.newTextStyles) {
    let s = styles.find((x) => x.name === name);
    if (!s) { s = figma.createTextStyle(); s.name = name; log.created.push(name); }
    apply(s, family, style, size, lh, ls, tc);
    s.description = 'Eyebrow above a heading: mono, uppercase. Replaces status badges used as decoration.';
  }
  const effects = await figma.getLocalEffectStylesAsync();
  for (const [name, map] of Object.entries(SPEC.effectColor)) {
    const e = effects.find((x) => x.name === name);
    e.effects = e.effects.map((l) => {
      const hit = Object.entries(map).find(([from]) => same(l.color, rgba(from)));
      return hit ? { ...l, color: { ...rgba(hit[1]), a: l.color.a } } : l;
    });
  }
  return log;
}
return { stop: 'unknown STEP ' + STEP };
