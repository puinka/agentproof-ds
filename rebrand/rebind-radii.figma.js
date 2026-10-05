// Rebinds corner radii from the BASE scale to ROLE tokens (Semantic / Shape), so a brand change in
// radius/* roles reaches every component. Runner prepends `const PAGE = '<name>'; const DRY = true|false;`.
// Rule (design.md §2.5): a surface that holds content is a container; a control or a block inside one is
// inner/control; tiny marks are small; pills stay pills. Text inside instances follows their main component.
const EXPECTED_FILE = 'Agentproof DS';
if (figma.root.name !== EXPECTED_FILE) return { stop: figma.root.name };
if (/REG FLOW/.test(PAGE)) return { skipped: PAGE };
const page = figma.root.children.find((p) => p.name === PAGE);
await page.loadAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const byId = Object.fromEntries(vars.map((v) => [v.id, v]));
const role = (n) => vars.find((v) => v.name === n && v.resolvedType === 'FLOAT');
const R = { container: role('radius/container'), control: role('radius/control'), inner: role('radius/inner'), small: role('radius/small'), pill: role('radius/pill') };
const inInst = (n) => { for (let p = n.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
const inSet = (n, re) => { for (let p = n; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'COMPONENT_SET' && re.test(p.name)) return true; return false; };
const controlSets = /^(Button|text input|Field|Filter chip|Badge|Switch|Checkbox|Box|Option tile|Dropdown|Select|Input.*)$/i;
const isSurface = (n) => n.width >= 160 && n.height >= 96;

const plan = [];
for (const n of page.findAllWithCriteria({ types: ['FRAME', 'COMPONENT', 'RECTANGLE', 'INSTANCE'] })) {
  if (inInst(n) || typeof n.topLeftRadius !== 'number' || !(n.topLeftRadius > 0)) continue;
  const b = n.boundVariables && (n.boundVariables.topLeftRadius || n.boundVariables.cornerRadius);
  const from = b ? byId[b.id]?.name : 'raw:' + Math.round(n.topLeftRadius);
  if (/radius\/(full|pill|container|control|inner|small)$/.test(from) || n.topLeftRadius >= 999) continue; // already a role, or a pill
  if (!b && n.topLeftRadius % 1 !== 0) continue; // fractional raw radii belong to vector art (logos), not UI
  let to;
  if (n.topLeftRadius * 2 >= Math.min(n.width, n.height) - 0.5) to = 'pill'; // fully rounded today (switch track, avatar): stays round
  else if (/radius\/(xs|sm)$/.test(from) || n.topLeftRadius <= 4) to = 'small';
  else if (n.height <= 56 || (inSet(n, controlSets) && !isSurface(n))) to = 'control'; // control height: buttons, inputs, chips
  else if (isSurface(n) || n.topLeftRadius >= 12) to = 'container';
  else to = 'inner';
  plan.push([n, from, to]);
}
const summary = {};
for (const [, from, to] of plan) summary[`${from} -> ${to}`] = (summary[`${from} -> ${to}`] || 0) + 1;
if (DRY) return { page: PAGE, dry: true, nodes: plan.length, summary };
// Only corners that are rounded today get the role (an image with rounded top corners keeps square bottoms).
for (const [n, , to] of plan) for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) if (n[k] > 0) n.setBoundVariable(k, R[to]);
return { page: PAGE, nodes: plan.length, summary };
