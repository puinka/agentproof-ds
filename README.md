# Agentproof DS · reference implementation

Code for the Agentproof design system (portfolio brand «Voltwise»), built from its Figma working copy.
It is a **reference implementation**: how the system would look in code in an ideal setup,
not the client's production code.

## About this project
A personal, unpaid project: nobody commissioned, briefed or paid for it. I first built the design system
for myself, to work faster on a client's product; in the end the client's team and developer used it too.
The original branding is by another designer. For this case I updated it to my own taste (a deliberate,
not radical shift), changed the name and logo («Voltwise» is fictional) and rewrote the copy; the niche and
rough content stay close to the real product. It does not represent the client, and the client has not
reviewed or endorsed it. Full text: `src/About.mdx` (first page in Storybook).

## How it is built
- **One source for tokens.** `tokens/figma-variables.json` is a read-only export of the Figma
  variables and styles (`scripts/export-figma-variables.figma.js`). `npm run tokens` generates
  `src/styles/tokens.css`. Nobody edits the CSS by hand.
- **Only semantic roles become classes.** Base colours exist as CSS variables but Tailwind's
  default palette is switched off, so `bg-slate-500` doesn't exist and `bg-action` does
  (design.md §2.4). Spacing and radius keep the Tailwind v4 scale (design.md §2.2).
- **Component docs follow one shape** (borrowed from Astryx): Usage → Anatomy →
  Best practices → Examples → Properties (with the Figma ↔ code mapping) → Accessibility
  (contrast computed from tokens).
- **Checks:** `npm run test:stories` builds Storybook and visits every story: the `play`
  interaction tests must pass and axe must find no violations. The checker listens to
  Storybook's own events (a canary story with a failing test is caught).

## Commands
```
npm install
npm run storybook        # dev server on :6006
npm run build-storybook  # static build in storybook-static/
npm run typecheck
npm run test:stories    # needs a static server on :6009 for storybook-static
npm run lint:ds -- src/screens   # product code against the DS rules (after a build, to catch dead classes)
```

## Deploy
Published at **https://ds.valerianyman.com** with Cloudflare Pages, connected to this repository.
- Build command: `npm run build-storybook`
- Output directory: `storybook-static`
- Node: 22 (from `.node-version`)
- Link preview: `public/og.png` (1200 × 630), referenced in `.storybook/manager-head.html`
- Custom domain: `ds.valerianyman.com` (DNS on Cloudflare, so Pages adds the CNAME itself)

Every push to `main` rebuilds the site; pull requests get preview URLs.

## Status (2026-10-07)
- Brand: cobalt + lime accent on ink neutrals, Host Grotesk + Geist Mono, radii 4/8, iso grid. `tokens/figma-variables.json`
  matches the live Figma file (fingerprints in its `_source`).
- Foundations: Colors (text, background, border).
- Components: Button, Field + TextInput, Checkbox, Switch, RadioList, Badge, Banner, Dialog, Table, FileUpload, Form, Filter chip, Stepper, Card, Page; Iso grid;
  patterns: Site header, Flow diagram (101 stories, all passing).
- Wave 2 (2026-10-05): Dialog (native `<dialog>`), Banner (status message), RadioList (list and tiles), Table (caption,
  row headers, sorting, scroll frame). Matching Figma sets on the Components page, section «Wave 2 (2026-10-05)».
- From build-run D (2026-10-07): `Page` with two content widths, `size/content-narrow` (640) and `size/content-default` (880);
  `FileUpload` (choose, take a photo, drop, file row, status, error); icons `arrow-up-tray`, `camera`, `document`;
  Table frame is a named region only while it overflows. Synced to Figma on 2026-10-07: `size/content-*` variables, `FileUpload` and `Page` sets (section «Wave 3»), the three icons;
  `tokens/pending-figma.json` is empty again (the token build warns whenever it has entries).
- Errors and announcements (2026-10-07): field messages (Field, RadioList, Checkbox) sit in a live region that is always on the
  page, so an error after submit is announced; `Form` moves focus to the first invalid control; `BannerRegion` (and Page
  `notices`) for Banners that appear after an action.
- Guardrails for agents: `AGENTS.md` (what "done" means, what the system already has) and `npm run lint:ds` (raw colours,
  inline styles, arbitrary values, dead classes, hand-built file input / dialog / table / radio / checkbox / button).
- Next: templates rebuilt on these components.
