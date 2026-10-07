import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { SiteHeader } from '../components/SiteHeader/SiteHeader';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';
import { Icon } from '../icons/Icon';

/**
 * Brand structure explorations (2026-10-05). Valeria: stay close to the client's brand principle
 * (blue actions, lime accent) and modernise. The structure is borrowed from a technical, dev-tool look
 * that no one in the market uses: neutral light grey, a quiet tile grid, mono labels in brackets,
 * the accent colour on the second headline phrase, and a calculator bar in the place of a search bar.
 * Host Grotesk is the candidate typeface. Variants differ only in where the accent goes.
 */
type Variant = { key: string; title: string; note: string; vars: Record<string, string>; sparkOnLight: string };

const host = { '--font-heading': "'Host Grotesk', sans-serif", '--font-body': "'Host Grotesk', sans-serif" };
const variants: Variant[] = [
  {
    key: 'v1', title: 'V1 · Cobalt + lime spark',
    note: 'Closest to the client principle: cobalt does the work (CTA, accent phrase, marks on light), lime only lights up on dark.',
    vars: { ...host }, sparkOnLight: 'var(--color-text-accent)',
  },
  {
    key: 'v2', title: 'V2 · Lime in the frame',
    note: 'Same, with lime given a light job too: a lime tile in the grid and lime keylines under the mono labels.',
    vars: { ...host }, sparkOnLight: 'var(--color-background-highlight)',
  },
  {
    key: 'v3', title: 'V3 · Cobalt + warm spark (comparison)',
    note: 'Further from the client: lime replaced by a warm electric orange as the spark. Shown only to compare.',
    vars: { ...host, '--color-background-highlight': '#ff7a3d', '--color-text-highlight': '#ff9a68', '--color-text-on-highlight': '#0a0b14', '--color-border-highlight': '#ff7a3d' },
    sparkOnLight: '#c2410c',
  },
];

const nav = [{ label: 'How it works', href: '#h' }, { label: 'Fleets', href: '#f' }, { label: 'Knowledge', href: '#k', current: true }];

/** Quiet tile grid: hairlines every 72 px with a dot at each crossing. Decorative. */
const grid: CSSProperties = {
  backgroundImage:
    'radial-gradient(circle at 0 0, var(--color-border-default) 1.5px, transparent 2px),' +
    'linear-gradient(to right, var(--color-border-subtle) 1px, transparent 1px),' +
    'linear-gradient(to bottom, var(--color-border-subtle) 1px, transparent 1px)',
  backgroundSize: '72px 72px',
  backgroundPosition: '-1px -1px',
};

function Bracket({ children, spark }: { children: ReactNode; spark?: string }) {
  return (
    <span className="inline-flex items-center gap-2 type-desktop-body-eyebrow text-tertiary">
      {spark && <span className="size-1.5" style={{ background: spark }} aria-hidden="true" />}[ {children} ]
    </span>
  );
}

function CalculatorBar() {
  const types = ['Car', 'Van', 'Bus', 'Motorbike'] as const;
  const [type, setType] = useState<(typeof types)[number]>('Car');
  return (
    <div className="w-full max-w-content-narrow rounded-container border border-subtle bg-surface p-2 shadow-sm text-left">
      <label className="flex items-center gap-3 px-3 py-3">
        <span className="sr-only">Number of vehicles</span>
        <span className="whitespace-nowrap type-desktop-body-caption-default text-tertiary">How many?</span>
        <input type="number" min={1} defaultValue={1} className="w-full bg-transparent type-desktop-body-paragraph-default text-primary outline-none" />
      </label>
      <div className="flex items-center justify-between gap-2 border-t border-subtle px-1 pt-2">
        <div role="radiogroup" aria-label="Vehicle type" className="flex gap-1">
          {types.map((t) => (
            <button key={t} type="button" role="radio" aria-checked={type === t} onClick={() => setType(t)}
              className={`rounded-control px-3 py-1.5 type-desktop-body-caption-strong outline-none focus-visible:shadow-focus ${type === t ? 'bg-muted text-primary' : 'text-tertiary hover:text-primary'}`}>
              {t}
            </button>
          ))}
        </div>
        <Button size="sm" label="Calculate my bonus" icon={<Icon name="arrow-right" />} />
      </div>
    </div>
  );
}

function Sample({ v }: { v: Variant }) {
  return (
    <section style={v.vars as CSSProperties} className="bg-surface text-primary border border-subtle rounded-container overflow-hidden font-body">
      <div className="px-6 pt-4 pb-2 flex items-baseline gap-3">
        <p className="m-0 type-desktop-header-card-strong">{v.title}</p>
        <p className="m-0 type-desktop-body-caption-default text-tertiary">{v.note}</p>
      </div>
      <SiteHeader audience="individuals" items={nav} cta={{ label: 'Register now', href: '#r' }} />
      <div className="relative bg-subtle" style={grid}>
        <div className="absolute left-6 top-6"><Bracket>GHG bonus 2026</Bracket></div>
        <div className="absolute right-6 top-6"><Bracket spark={v.sparkOnLight}>Paid in 7 days</Bracket></div>
        {v.key === 'v2' && <span className="absolute right-[144px] top-[144px] size-[72px] bg-highlight" aria-hidden="true" />}
        <div className="flex flex-col items-center gap-6 px-6 pt-20 pb-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-subtle bg-surface px-3 py-1 type-desktop-body-caption-default text-secondary">
            New: fleets of up to 500 vehicles <Icon name="chevron-right" size={16} />
          </span>
          <h1 className="m-0 type-desktop-header-large-strong text-[64px] leading-[1.02] tracking-[-0.035em]">
            Drive electric.<br /><span className="text-accent">Get paid for it.</span>
          </h1>
          <p className="m-0 max-w-[520px] type-desktop-body-paragraph-default text-secondary">Register your EV in a few minutes and secure your yearly GHG bonus. We take care of the paperwork.</p>
          <CalculatorBar />
        </div>
      </div>
      <div className="grid grid-cols-4 border-t border-subtle">
        {[
          ['01', 'Register', 'Upload your registration certificate. Two minutes, on any phone.'],
          ['02', 'We certify', 'We file with the Federal Environment Agency for you.'],
          ['03', 'Get paid', 'Your bonus arrives within 7 days of certification.'],
        ].map(([n, t, d]) => (
          <div key={n} className="flex flex-col gap-3 border-r border-subtle p-6">
            <span className="type-desktop-body-eyebrow" style={{ color: v.key === 'v2' ? 'var(--color-text-primary)' : v.sparkOnLight, borderBottom: v.key === 'v2' ? '2px solid var(--color-background-highlight)' : undefined, alignSelf: 'flex-start' }}>[ {n} ]</span>
            <h2 className="m-0 type-desktop-header-card-strong">{t}</h2>
            <p className="m-0 type-desktop-body-caption-default text-secondary">{d}</p>
          </div>
        ))}
        <Card tone="accent" className="rounded-none">
          <span className="type-desktop-body-eyebrow text-on-accent">[ Average bonus ]</span>
          <p className="m-0 type-desktop-header-medium-strong text-[44px] leading-[1] tracking-[-0.04em] text-highlight">€250<span className="type-desktop-header-card-default text-on-accent"> /year</span></p>
          <p className="m-0 type-desktop-body-caption-default text-on-accent">For a fully electric car.</p>
        </Card>
      </div>
    </section>
  );
}

const meta = { title: 'Foundations/Brand structure', parameters: { layout: 'padded' }, tags: ['!autodocs'] } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const wrap = (n: ReactNode) => <div className="flex flex-col gap-8 w-[1200px]">{n}</div>;
export const AllVariants: Story = {
  name: 'All variants',
  // Three full page headers in one view is a comparison sheet, not a page: duplicate landmarks are expected here only.
  parameters: { a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } } },
  render: () => wrap(variants.map((v) => <Sample key={v.key} v={v} />)),
};
export const V1: Story = { name: 'V1 · Cobalt + lime spark', render: () => wrap(<Sample v={variants[0]} />) };
