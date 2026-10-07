// lint:ds — checks product code against the design system's rules. A rule in a prompt is a request;
// this is the same rule enforced by a tool (build-run D: every drift the agents made is caught here).
//
// Usage: node scripts/lint-ds.mjs [dir-or-file ...]   (default: src, minus the design system itself)
// Exit 1 on any error. Warnings don't fail.
// Exception, only with a reason, on the line above: // lint-ds-ignore <rule>: <why>
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const DS_DIRS = ['src/components', 'src/icons', 'src/styles', 'src/foundations', 'src/recipes'];
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['src'];

const files = [];
const walk = (p) => {
  const abs = path.resolve(root, p);
  if (!fs.existsSync(abs)) return;
  const rel = path.relative(root, abs).split(path.sep).join('/');
  if (fs.statSync(abs).isDirectory()) {
    if (process.argv.slice(2).length === 0 && DS_DIRS.some((d) => rel === d || rel.startsWith(d + '/'))) return;
    if (/node_modules|storybook-static/.test(rel)) return;
    for (const f of fs.readdirSync(abs)) walk(path.join(abs, f));
  } else if (/\.(tsx|jsx|ts|js)$/.test(abs) && !/\.d\.ts$/.test(abs)) files.push(abs);
};
targets.forEach(walk);

// Built CSS, if there is a build: lets us flag classes that silently do nothing.
let css = '';
const cssDir = path.join(root, 'storybook-static/assets');
if (fs.existsSync(cssDir)) css = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8')).join('\n');
const esc = (c) => c.replace(/([^a-zA-Z0-9_-])/g, '\\$1');

const widthHint = (v) => {
  const px = parseInt(v, 10);
  if (!px) return '';
  return px <= 720 ? ' Use `max-w-content-narrow` (640) or `<Page width="narrow">`.' : ' Use `max-w-content-default` (880) or `<Page>`.';
};

const rules = [
  { id: 'raw-colour', level: 'error', re: /#[0-9a-fA-F]{3,8}\b(?![\w-])|\brgba?\(|\bhsla?\(|\boklch\(/g,
    msg: () => 'Raw colour. Use a semantic class: text-*, bg-*, border-* (see Foundations / Colors).' },
  { id: 'inline-style', level: 'error', re: /style=\{\{/g, msg: () => 'Inline style. Use DS classes; if a value is missing, write it in GAPS.md.' },
  { id: 'arbitrary-value', level: 'error', re: /\b[a-z][a-z0-9:-]*-\[[^\]\s]+\]/g,
    msg: (m) => `Arbitrary value \`${m}\`.` + (/max-w-\[(\d+)px\]/.test(m) ? widthHint(m.match(/\[(\d+)/)[1]) : ' Use a token class; if none fits, write it in GAPS.md.') },
  { id: 'native-file-input', level: 'error', re: /(?<!\[)type=["']file["']/g, msg: () => 'Hand-built file input. Use `FileUpload`.' },
  { id: 'native-dialog', level: 'error', re: /<dialog\b|role=["']dialog["']|role=["']alertdialog["']/g, msg: () => 'Hand-built dialog. Use `Dialog`.' },
  { id: 'native-table', level: 'error', re: /<table\b/g, msg: () => 'Hand-built table. Use `Table`.' },
  { id: 'native-radio', level: 'error', re: /(?<!\[)type=["']radio["']/g, msg: () => 'Hand-built radio. Use `RadioList`.' },
  { id: 'native-checkbox', level: 'error', re: /(?<!\[)type=["']checkbox["']/g, msg: () => 'Hand-built checkbox. Use `Checkbox` or `Switch`.' },
  { id: 'native-button', level: 'error', re: /<button\b/g, msg: () => 'Hand-built button. Use `Button` (variant, tone, size).' },
  { id: 'native-form', level: 'warning', re: /<form\b/g, msg: () => 'Plain <form>. `Form` moves focus to the first invalid control after submit.' },
  { id: 'own-h1', level: 'warning', re: /<h1\b/g, msg: () => 'Own <h1>. `Page` renders the page title at the one DS weight.' },
  { id: 'banner-live-polite', level: 'warning', re: /live=["']polite["']/g,
    msg: () => 'Banner `live="polite"` mounting with its own region is often not announced. Put it in Page `notices` or a `BannerRegion`.' },
];

const results = [];
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const isStory = /\.stories\./.test(rel);
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // comments
    const prev = lines[i - 1] ?? '';
    for (const r of rules) {
      if (isStory && r.level === 'warning') continue;
      for (const m of line.matchAll(r.re)) {
        const ignore = prev.match(new RegExp(`lint-ds-ignore\\s+${r.id}:\\s*(.+)`));
        results.push({ file: rel, line: i + 1, rule: r.id, level: ignore ? 'ignored' : r.level, msg: ignore ? `ignored: ${ignore[1].trim()}` : r.msg(m[0]) });
      }
    }
    // Dead classes: only in className strings, only when a build exists.
    if (css) {
      for (const m of line.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g)) {
        const str = (m[1] ?? m[2] ?? m[3]).replace(/\$\{[^}]*\}/g, ' ');
        for (const t of str.split(/\s+/)) {
          if (!t || /^\d|^\$|^(group|peer|sr-only|not-sr-only)$/.test(t)) continue;
          if (!css.includes('.' + esc(t))) results.push({ file: rel, line: i + 1, rule: 'dead-class', level: 'error', msg: `\`${t}\` has no CSS: it does nothing. The default Tailwind palette is off; use DS classes.` });
        }
      }
    }
  });
}

const errors = results.filter((r) => r.level === 'error');
const warnings = results.filter((r) => r.level === 'warning');
for (const r of results) {
  const tag = r.level === 'error' ? '✗' : r.level === 'warning' ? '!' : '·';
  console.log(`${tag} ${r.file}:${r.line}  ${r.rule}  ${r.msg}`);
}
console.log(`\nlint:ds — ${files.length ? files.length + ' files' : 'no product code found (the design system itself is not linted)'}, ${errors.length} errors, ${warnings.length} warnings${css ? '' : ' (no build found: dead-class check skipped; run the Storybook build first)'}`);
process.exit(errors.length ? 1 : 0);
