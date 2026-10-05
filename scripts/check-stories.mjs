// Visits every story in a static Storybook build: play functions must pass, axe must find nothing.
// Usage: npx storybook build -o storybook-static && npx http-server storybook-static -p 6009 & node scripts/check-stories.mjs http://localhost:6009
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base = process.argv[2] ?? 'http://localhost:6009';
const exe = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 } });
const page = await ctx.newPage();
// Listen to Storybook's preview channel: play-function exceptions and render errors are reported there.
await page.addInitScript(() => {
  window.__sbEvents = [];
  let ch;
  Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
    configurable: true,
    get: () => ch,
    set: (v) => {
      ch = v;
      for (const ev of ['playFunctionThrewException', 'storyThrewException', 'storyErrored', 'storyRendered', 'storyFinished'])
        v.on(ev, (payload) => window.__sbEvents.push({ ev, msg: payload && (payload.message || payload.title || (payload.status ?? '')) }));
    },
  });
});
const index = await (await fetch(`${base}/index.json`)).json();
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
let failed = 0;
for (const s of stories) {
  const errors = [];
  const onErr = (m) => { if (m.type() === 'error') errors.push(m.text()); };
  page.on('console', onErr);
  // Stories named "mobile" run at phone width so breakpoint-dependent tests are exercised.
  await page.setViewportSize(/mobile|narrow/.test(s.id) ? { width: 390, height: 844 } : { width: 1100, height: 800 });
  await page.goto(`${base}/iframe.html?id=${s.id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__sbEvents.some((e) => ['storyRendered', 'storyFinished', 'playFunctionThrewException', 'storyThrewException', 'storyErrored'].includes(e.ev)), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(300);
  const events = await page.evaluate(() => window.__sbEvents);
  const failures = events.filter((e) => ['playFunctionThrewException', 'storyThrewException', 'storyErrored'].includes(e.ev) || (e.ev === 'storyFinished' && e.msg === 'error'));
  const playFailed = failures.length > 0 || !events.length;
  if (failures.length) errors.unshift(failures.map((f) => f.ev + ': ' + f.msg).join('; '));
  if (!events.length) errors.unshift('no Storybook events received');
  // Rules a story turns off in its own a11y parameters are listed here too, with the same reason (keep the two in sync).
  const skip = { 'foundations-brand-refresh--before-after': ['landmark-unique'], 'foundations-brand-structure--all-variants': ['landmark-unique'] }[s.id] ?? [];
  const axe = await new AxeBuilder({ page }).include('#storybook-root').disableRules(skip).analyze();
  page.off('console', onErr);
  const bad = playFailed || axe.violations.length;
  if (bad) failed++;
  console.log(`${bad ? '✗' : '✓'} ${s.id}${playFailed ? ' · play failed: ' + errors.slice(0, 1).join(' ') : ''}${axe.violations.length ? ' · axe: ' + axe.violations.map((v) => v.id).join(',') : ''}`);
}
await browser.close();
console.log(`\n${stories.length - failed}/${stories.length} stories passed`);
process.exit(failed ? 1 : 0);
