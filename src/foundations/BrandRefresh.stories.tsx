import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import { SiteHeader } from '../components/SiteHeader/SiteHeader';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';
import { Badge } from '../components/Badge/Badge';
import { Field } from '../components/Field/Field';
import { TextInput } from '../components/TextInput/TextInput';
import { Icon } from '../icons/Icon';
import { before2026, beforeTypeCss } from './brand-before';

/**
 * Brand refresh, 2026-10-05. Before: the portfolio palette as of 2026-10-04 (indigo, lime marker,
 * Outfit 700 + Manrope 300, 16/24 radii, soft shadows). After: direction A (Geist, radii 4/8,
 * mono labels) with the colours of direction C (cobalt actions, cool ink neutrals).
 * Directions explored and dropped: A with ink actions, B (serif + forest green), C with Inter Tight.
 * The After sample uses the live tokens with no overrides; the Before sample re-applies the old values.
 */

const nav = [{ label: 'Knowledge', href: '#k' }, { label: 'Blog', href: '#b', current: true }, { label: 'Contact', href: '#c' }];

/** Old composition: badge, marker highlight, icon in a tinted square, bold headings, light body. */
function Before() {
  return (
    <div className="grid grid-cols-[1.3fr_1fr] gap-8 bg-subtle px-6 py-10">
      <div className="flex flex-col gap-5">
        <Badge status="success" label="Paid out within 7 days" />
        <h1 className="m-0 type-desktop-header-medium-strong">Drive electric, <span className="bg-highlight text-on-highlight rounded-small px-1">earn money</span></h1>
        <p className="m-0 type-desktop-body-paragraph-default text-secondary">Register your EV in a few minutes and secure your yearly GHG bonus. We take care of the rest.</p>
        <div className="flex items-end gap-3">
          <Field label="Email address" className="w-72"><TextInput type="email" placeholder="name@example.com" /></Field>
          <Button label="Claim your bonus" icon={<Icon name="arrow-right" />} />
        </div>
      </div>
      <div className="flex gap-4">
        <Card elevation="md" className="flex-1">
          <span className="inline-flex size-10 items-center justify-center rounded-inner bg-accent-muted text-accent" aria-hidden="true"><Icon name="check-circle" /></span>
          <h2 className="m-0 type-desktop-header-card-strong">Guaranteed payout</h2>
          <p className="m-0 type-desktop-body-caption-default text-secondary">Your payout is guaranteed by contract.</p>
          <Button variant="ghost" size="sm" label="Learn more" className="self-start" />
        </Card>
        <Card tone="accent" className="flex-1">
          <h2 className="m-0 type-desktop-header-card-strong text-inverse">€ 250 a year</h2>
          <p className="m-0 type-desktop-body-caption-default text-on-accent">Average bonus for an electric car.</p>
          <Button variant="ghost" onDark size="sm" label="Calculate" className="self-start" />
        </Card>
      </div>
    </div>
  );
}

/**
 * New composition, from current references: mono eyebrow instead of a badge; regular-weight display
 * with tight tracking, second phrase in a quieter colour instead of a marker; bare icons; hairline
 * cards; the figure is the hero of the dark card. Display size 60 px is a template decision, not a text style.
 */
function After() {
  return (
    <div className="grid grid-cols-[1.3fr_1fr] gap-8 bg-subtle px-6 py-12">
      <div className="flex flex-col gap-6">
        <p className="m-0 flex items-center gap-2 type-desktop-body-eyebrow text-secondary">
          <span className="size-1.5 bg-highlight" aria-hidden="true" />Paid out within 7 days
        </p>
        <h1 className="m-0 type-desktop-header-large-strong text-[60px] leading-[1] tracking-[-0.045em]">
          Drive electric,<br /><span className="text-tertiary">earn money.</span>
        </h1>
        <p className="m-0 max-w-[520px] type-desktop-body-paragraph-default text-secondary">Register your EV in a few minutes and secure your yearly GHG bonus. We take care of the rest.</p>
        <div className="flex items-end gap-3">
          <Field label="Email address" className="w-72"><TextInput type="email" placeholder="name@example.com" /></Field>
          <Button label="Claim your bonus" icon={<Icon name="arrow-right" />} />
        </div>
      </div>
      <div className="flex gap-4">
        <Card className="flex-1">
          <span className="icon-primary" aria-hidden="true"><Icon name="check-circle" /></span>
          <h2 className="m-0 type-desktop-header-card-strong">Guaranteed payout</h2>
          <p className="m-0 type-desktop-body-caption-default text-secondary">Your payout is guaranteed by contract.</p>
          <Button variant="ghost" size="sm" label="Learn more" className="self-start mt-auto" />
        </Card>
        <Card tone="accent" className="flex-1">
          <p className="m-0 type-desktop-body-eyebrow text-on-accent">Average bonus</p>
          <h2 className="m-0 type-desktop-header-medium-strong text-[44px] leading-[1] tracking-[-0.045em] text-highlight">€250<span className="type-desktop-header-card-default text-on-accent"> /year</span></h2>
          <p className="m-0 type-desktop-body-caption-default text-on-accent">For a fully electric car, paid once a year.</p>
          <Button variant="ghost" onDark size="sm" label="Calculate" className="self-start mt-auto" />
        </Card>
      </div>
    </div>
  );
}

function Frame({ title, note, vars, scope, children }: { title: string; note: string; vars?: Record<string, string>; scope?: 'before'; children: ReactNode }) {
  return (
    <section style={vars as CSSProperties} className={`${scope ? `brand-${scope} ` : ''}bg-surface text-primary border border-subtle rounded-container overflow-hidden font-body`}>
      {scope === 'before' && <style>{beforeTypeCss}</style>}
      <div className="px-6 pt-4 pb-2 flex items-baseline gap-3">
        <p className="m-0 type-desktop-header-card-strong">{title}</p>
        <p className="m-0 type-desktop-body-caption-default text-tertiary">{note}</p>
      </div>
      <SiteHeader audience="individuals" items={nav} cta={{ label: 'Register now', href: '#r' }} />
      {children}
    </section>
  );
}

const meta = { title: 'Foundations/Brand refresh', parameters: { layout: 'padded' }, tags: ['!autodocs'] } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const wrap = (n: ReactNode) => <div className="flex flex-col gap-8 w-[1200px]">{n}</div>;
const before = <Frame key="b" title="Before (2026-10-04)" note="Indigo fills, lime marker, Outfit 700 + Manrope 300, radii 16/24, soft shadows." vars={before2026} scope="before"><Before /></Frame>;
const after = <Frame key="a" title="After (2026-10-05)" note="Cobalt actions, lime accent, cool ink neutrals, Host Grotesk + Geist Mono, radii 4/8, hairlines instead of shadows."><After /></Frame>;


export const BeforeAfter: Story = {
  name: 'Before / after',
  // Two full page headers in one view is a comparison sheet, not a page: duplicate landmarks are expected here only.
  parameters: { a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } } },
  render: () => wrap([before, after]),
};
export const AfterOnly: Story = { name: 'After', render: () => wrap(after) };
