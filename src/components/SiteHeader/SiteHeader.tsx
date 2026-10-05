import { useEffect, useId, useRef, useState } from 'react';
import { Logo } from '../Logo/Logo';
import { Button } from '../Button/Button';
import { Icon } from '../../icons/Icon';

/**
 * Figma: `Site header` (`Audience=Individuals|Businesses` · `Breakpoint=Desktop|Mobile` · `Surface=Light|Dark`,
 * slot `Nav items`) with `Site header / Nav item`, `/ Audience item`, `/ Menu button`, `/ Menu panel`.
 * Spec: specs/components/site-header.md (N-R1…N-R15). Pattern: an audience bar above the main row.
 * - Breakpoint is CSS (md = 768 px), not a prop.
 * - `elevated` (sticky, scrolled) forces the light surface and adds `shadow-sm`.
 * - Agent rules: Nav items and Audience items live only inside this header; audience links never go in `items`.
 */
export interface NavLink { label: string; href: string; current?: boolean }
export interface SiteHeaderProps {
  audience: 'individuals' | 'businesses';
  audienceHrefs?: { individuals: string; businesses: string };
  /** 2–5 sections for the current audience (N-R14). */
  items: NavLink[];
  cta: { label: string; href: string };
  loginHref?: string;
  surface?: 'light' | 'dark';
  elevated?: boolean;
  homeHref?: string;
  /** Id of the page's main element, for the skip link (N-R1). */
  mainId?: string;
}

export function SiteHeader({
  audience,
  audienceHrefs = { individuals: '/', businesses: '/business' },
  items,
  cta,
  loginHref = '/login',
  surface = 'light',
  elevated = false,
  homeHref = '/',
  mainId = 'main',
}: SiteHeaderProps) {
  if ((items.length < 2 || items.length > 5) && import.meta.env?.DEV) console.warn('[SiteHeader] items: 2 to 5 sections (N-R14).');
  const dark = surface === 'dark' && !elevated;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const txt = dark ? 'text-inverse' : 'text-primary';
  const txt2 = dark ? 'text-inverse-secondary hover:text-inverse' : 'text-secondary hover:text-primary';
  const indicator = dark ? 'border-highlight' : 'border-accent';
  const audiences = [
    { key: 'individuals' as const, label: 'For individuals' },
    { key: 'businesses' as const, label: 'For businesses' },
  ];
  const linkBase = 'no-underline outline-none focus-visible:shadow-focus rounded-small';

  return (
    <header className={`relative z-10 w-full ${elevated ? 'sticky top-0 bg-surface shadow-sm' : dark ? 'bg-transparent' : 'bg-surface'}`}>
      <a href={`#${mainId}`} className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-20 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:shadow-focus type-desktop-body-label text-accent">
        Skip to content
      </a>

      {/* Audience bar (desktop) */}
      <div className={`hidden md:flex h-8 items-center gap-6 px-6 ${dark ? '' : 'border-b border-subtle'}`}>
        {audiences.map((a) => {
          const cur = a.key === audience;
          return (
            <a key={a.key} href={audienceHrefs[a.key]} aria-current={cur ? 'page' : undefined}
              className={`${linkBase} inline-flex min-h-target-min items-center border-b-2 type-desktop-body-caption-strong ${cur ? `${txt} ${indicator}` : `${txt2} border-transparent`}`}>
              {a.label}
            </a>
          );
        })}
      </div>

      {/* Main row */}
      <div className="flex h-14 md:h-16 items-center gap-8 px-4 md:px-6">
        <a href={homeHref} aria-label="Voltwise, home" className={`${linkBase} shrink-0`}><Logo tone={dark ? 'inverse' : 'default'} /></a>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="m-0 flex list-none gap-6 p-0">
            {items.map((it) => (
              <li key={it.href}>
                <a href={it.href} aria-current={it.current ? 'page' : undefined}
                  className={`${linkBase} inline-flex min-h-target-min items-center border-b-2 type-desktop-body-label ${it.current ? `${txt} ${indicator}` : `${txt2} border-transparent hover:underline`}`}>
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden md:flex items-center gap-4">
          <Button variant="link" onDark={dark} label="Log in" href={loginHref} />
          <Button label={cta.label} href={cta.href} />
        </div>

        <button
          ref={menuBtn}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className={`ml-auto md:hidden inline-flex min-h-control-md min-w-11 items-center gap-2 rounded-control px-2 outline-none focus-visible:shadow-focus type-desktop-body-label ${txt}`}
        >
          <Icon name={open ? 'x-mark' : 'bars-3'} />
          Menu
        </button>
      </div>

      {/* Mobile menu panel */}
      <div id={panelId} hidden={!open} className="md:hidden border-t border-subtle bg-surface px-4 pb-6 pt-4">
        <nav aria-label="Audience" className="mb-4">
          <ul className="m-0 flex list-none gap-4 p-0">
            {audiences.map((a) => (
              <li key={a.key}>
                <a href={audienceHrefs[a.key]} aria-current={a.key === audience ? 'page' : undefined}
                  className={`${linkBase} inline-flex min-h-target-min items-center border-b-2 type-desktop-body-caption-strong ${a.key === audience ? 'text-primary border-accent' : 'text-secondary border-transparent'}`}>
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Main (mobile)">
          <ul className="m-0 flex list-none flex-col p-0">
            {items.map((it) => (
              <li key={it.href} className="border-b border-subtle">
                <a href={it.href} aria-current={it.current ? 'page' : undefined}
                  className={`${linkBase} flex min-h-control-lg items-center type-desktop-body-paragraph-strong ${it.current ? 'text-accent' : 'text-primary'}`}>
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-4 flex flex-col gap-3">
          <Button variant="link" label="Log in" href={loginHref} className="self-start" />
          <Button label={cta.label} href={cta.href} className="w-full" />
        </div>
      </div>
    </header>
  );
}
