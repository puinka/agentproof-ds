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
```

## Deploy
Published at **https://ds.valerianyman.com** with Cloudflare Pages, connected to this repository.
- Build command: `npm run build-storybook`
- Output directory: `storybook-static`
- Node: 22 (from `.node-version`)
- Link preview: `public/og.png` (1200 × 630), referenced in `.storybook/manager-head.html`
- Custom domain: `ds.valerianyman.com` (DNS on Cloudflare, so Pages adds the CNAME itself)

Every push to `main` rebuilds the site; pull requests get preview URLs.

## Status (2026-10-05)
- Brand refresh: cobalt + lime accent on ink neutrals, Host Grotesk + Geist Mono, radii 4/8, iso grid (see `rebrand/2026-10-05-decision.md`
  and `Foundations/Brand refresh`). `tokens/figma-variables.json` matches the live Figma file (fingerprints in its `_source`).
- Foundations: Colors (text, background, border), Brand refresh (before / after).
- Components: Button, Field + TextInput, Checkbox, Switch, RadioList, Badge, Banner, Dialog, Table, Filter chip, Stepper, Card; Iso grid;
  patterns: Site header, Flow diagram (84 stories, all passing).
- Wave 2 (2026-10-05): Dialog (native `<dialog>`), Banner (status message), RadioList (list and tiles), Table (caption,
  row headers, sorting, scroll frame). Matching Figma sets on the Components page, section «Wave 2 (2026-10-05)».
- Next: templates rebuilt on these components.
