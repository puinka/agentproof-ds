import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { FlowDiagram, type FlowNode } from './FlowDiagram';
import { Logo } from '../Logo/Logo';

/** Placeholder isometric block. Replace with the real isometric tiles or icons from the illustration set. */
function IsoBlock({ tone = 'accent' }: { tone?: 'accent' | 'neutral' }) {
  const side = tone === 'accent' ? 'var(--color-text-accent)' : 'var(--color-icon-secondary)';
  return (
    <svg width="44" height="48" viewBox="0 0 44 48" aria-hidden="true" focusable="false">
      <path d="M22 2 L42 13.5 L22 25 L2 13.5 Z" fill="var(--color-background-muted)" stroke={side} strokeWidth="1.25" />
      <path d="M2 13.5 L22 25 V46 L2 34.5 Z" fill="var(--color-background-surface)" stroke={side} strokeWidth="1.25" />
      <path d="M42 13.5 L22 25 V46 L42 34.5 Z" fill={side} />
    </svg>
  );
}

const sources: FlowNode[] = [
  { id: 'ev', title: 'EV drivers', caption: 'Cars, vans, motorbikes', icon: <IsoBlock /> },
  { id: 'cpo', title: 'Charge point operators', caption: 'Public charging, green power', icon: <IsoBlock /> },
  { id: 'bio', title: 'Biomethane plants', caption: 'Biogenic fuels', icon: <IsoBlock /> },
];
const targets: FlowNode[] = [
  { id: 'fuel', title: 'Fuel suppliers', caption: 'Quota-obligated companies', icon: <IsoBlock tone="neutral" /> },
  { id: 'traders', title: 'Energy traders', caption: 'Portfolio and hedging', icon: <IsoBlock tone="neutral" /> },
  { id: 'util', title: 'Utilities', caption: 'Municipal and regional', icon: <IsoBlock tone="neutral" /> },
];
const hub = { title: <Logo tone="inverse" />, steps: ['Certify', 'Bundle', 'Trade', 'Report'], caption: 'Legal certainty for every tonne' };

const meta = {
  title: 'Patterns/Flow diagram',
  component: FlowDiagram,
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  args: { label: 'How the quota moves', sourcesLabel: 'Sources', targetsLabel: 'Buyers', sources, targets, hub },
} satisfies Meta<typeof FlowDiagram>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three in, three out: the standard case. The meaning is in the lists; the wires are decoration. */
export const QuotaFlow: Story = {
  decorators: [(S) => <div className="w-[1152px]"><S /></div>],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('list', { name: 'Sources' }).querySelectorAll('li')).toHaveLength(3);
    await expect(c.getByRole('list', { name: 'Steps' }).querySelectorAll('li')).toHaveLength(4);
  },
};

/** Uneven sides: two sources, four targets. Wires still leave the hub from evenly spaced entry points. */
export const Uneven: Story = {
  decorators: [(S) => <div className="w-[1152px]"><S /></div>],
  args: {
    sources: sources.slice(0, 2),
    targets: [...targets, { id: 'oem', title: 'Car makers', caption: 'Fleet compliance', icon: <IsoBlock tone="neutral" /> }],
  },
};

/** Narrow container (390 px): stacked lists, no wires. */
export const NarrowStacked: Story = {
  decorators: [(S) => <div className="w-[358px]"><S /></div>],
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg[width="168"]');
    await expect(svg && getComputedStyle(svg).display).toBe('none');
  },
};
