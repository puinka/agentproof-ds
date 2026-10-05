// Run in Figma through Console MCP `figma_execute` with fileKey of the copy (read-only).
// Returns the whole token export: variables, text styles and effect styles, in the format of
// tokens/figma-variables.json. Save it there (keep `_source`), then `npm run tokens`.
// Fingerprint check: the same name=value list, sorted, must hash identically on both sides.
const EXPECTED_FILE = 'Agentproof DS'; // set to your working copy's file name
if (figma.root.name !== EXPECTED_FILE) return { stop: figma.root.name };
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const byId = Object.fromEntries(vars.map((v) => [v.id, v]));
const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('') +
  (c.a !== undefined && c.a < 1 ? Math.round(c.a * 255).toString(16).padStart(2, '0') : '');
const W = { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, 'Semi Bold': 600, Bold: 700, ExtraBold: 800, Black: 900 };
const round = (n) => Math.round(n * 100) / 100;
const collections = cols.map((c) => ({
  name: c.name,
  vars: c.variableIds.map((id) => {
    const v = byId[id]; const val = v.valuesByMode[c.defaultModeId];
    const out = val && val.type === 'VARIABLE_ALIAS' ? '@' + byId[val.id].name : v.resolvedType === 'COLOR' ? hex(val) : val;
    return [v.name, out];
  }),
}));
const textStyles = (await figma.getLocalTextStylesAsync()).map((s) => [
  s.name, s.fontName.family, W[s.fontName.style] ?? 400, s.fontSize,
  s.lineHeight.unit === 'PIXELS' ? round(s.lineHeight.value) : null,
  s.letterSpacing.unit === 'PERCENT' ? round(s.letterSpacing.value) : 0,
  s.textCase && s.textCase !== 'ORIGINAL' ? s.textCase : null,
]);
const effectStyles = (await figma.getLocalEffectStylesAsync()).map((s) => [
  s.name, s.effects.filter((e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')
    .map((e) => [e.type === 'INNER_SHADOW' ? 'inner' : 'drop', hex(e.color), e.offset.x, e.offset.y, e.radius, e.spread ?? 0]),
]);
return { collections, textStyles, effectStyles };
