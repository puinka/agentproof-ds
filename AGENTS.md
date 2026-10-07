# AGENTS.md — building with Agentproof DS

You build product screens with this design system. These rules are checked by tools, not by trust.

## Done means all three pass
```
npm run typecheck
npm run build-storybook && npm run lint:ds -- src/screens   # your code, not the design system
npm run test:stories                                          # play tests + axe on every story
```
`lint:ds` exits 1 on errors. Don't silence a rule; if you must, put `// lint-ds-ignore <rule>: <reason>` on the line above, and add the case to GAPS.md.

## Where things are
- Components: `src/components/<Name>/<Name>.tsx` (props are documented in the file), with `<Name>.mdx` (when to use, do / don't, accessibility) and `<Name>.stories.tsx` (working examples with tests). Read the stories before you build: they are the recipes.
- Tokens: semantic classes only (`text-*`, `bg-*`, `border-*`, `type-*`, `rounded-*`, `max-w-content-*`). The default Tailwind palette is off; a class that isn't in the build does nothing.
- Don't edit `src/components`, `src/styles`, `src/icons`, `src/foundations`, `tokens/` or `.storybook`.

## The system already has
| Need | Use | Not |
|---|---|---|
| A page with a title | `Page` (`width="narrow"` for one task, default for lists) | your own `<h1>` / `max-w-[…]` |
| A form | `Form` + `Field`/`TextInput`, `RadioList`, `Checkbox` with `error` | `<form>` + your own focus code |
| One choice from 2–6 | `RadioList` (`layout="tiles"` with descriptions or prices) | a select or two buttons |
| Confirm an irreversible action | `Dialog` (`tone="destructive"`) | a page Banner or `confirm()` |
| A message about the whole page | `Banner` in Page `notices` or a `BannerRegion` | a Banner mounted on its own with `live="polite"` |
| An upload | `FileUpload` (`capture` for photos) | `<input type="file">` |
| Rows of records | `Table` (caption, `isRowHeader`, `align="end"` for amounts) | `<table>` or a grid of divs |
| A status word | `Badge` | a coloured dot |

## Meanings are reserved
`error` = it failed or blocks the task. `warning` = it will cause a problem later. `danger` / `tone="destructive"` = an action that can't be undone. Never swap them for the look.

## When the system doesn't have it
Don't invent a component, a prop or a value. Build the smallest thing from existing pieces, and write one line per gap in `GAPS.md` at the repo root: what you needed, what you did instead, how sure you are.
