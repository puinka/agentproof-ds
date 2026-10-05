// Swaps fonts on text that is NOT bound to a text style (spec.looseFonts). One page per run.
// The runner prepends `const SPEC = …; const PAGE = '<page name>'; const PHASE = 'masters' | 'overrides';`.
// PHASE masters skips text inside instances (they follow their main component);
// PHASE overrides then fixes instance text that still carries an old font as a local override.
// Reference pages with client screens are never touched.
const EXPECTED_FILE = 'Agentproof DS';
if (figma.root.name !== EXPECTED_FILE) return { stop: figma.root.name };
if (/REG FLOW/.test(PAGE)) return { skipped: PAGE };
const page = figma.root.children.find((p) => p.name === PAGE);
await page.loadAsync();
const { families, to, styles } = SPEC.looseFonts;
const inInstance = (n) => { for (let p = n.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };

// 1. Read everything first (no writes between reads: avoids layout flushes on big pages).
const jobs = [];
for (const t of page.findAllWithCriteria({ types: ['TEXT'] })) {
  if (PHASE === 'masters' && inInstance(t)) continue;
  for (const seg of t.getStyledTextSegments(['fontName', 'textStyleId'])) {
    if (seg.textStyleId || !families.includes(seg.fontName.family)) continue;
    const style = styles[seg.fontName.style.replace(/\s+/g, '')] ?? 'Regular';
    jobs.push([t, seg.start, seg.end, style, seg.fontName]);
  }
}
// 2. Load fonts: the new ones and the old ones on the nodes being edited.
const need = new Set(jobs.map((j) => j[3]));
for (const s of need) await figma.loadFontAsync({ family: to, style: s });
const old = new Set(jobs.map((j) => j[4].family + '|' + j[4].style));
for (const f of old) { const [family, style] = f.split('|'); await figma.loadFontAsync({ family, style }); }
// 3. Write.
let done = 0;
for (const [t, a, b, style] of jobs) { t.setRangeFontName(a, b, { family: to, style }); done++; }
return { page: PAGE, phase: PHASE, segments: done, nodes: new Set(jobs.map((j) => j[0].id)).size };
