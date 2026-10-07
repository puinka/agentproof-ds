import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Page } from './Page';
import { Banner } from '../Banner/Banner';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { Table, type TableColumn } from '../Table/Table';
import { FileUpload } from '../FileUpload/FileUpload';

interface Payout { id: string; date: string; plate: string; amount: number; status: 'paid' | 'pending' }
const payouts: Payout[] = [
  { id: 'p1', date: '14 Mar 2026', plate: 'VW-204-E', amount: 85, status: 'paid' },
  { id: 'p2', date: '2 Feb 2026', plate: 'KL-880-E', amount: 110, status: 'paid' },
  { id: 'p3', date: '21 Jan 2026', plate: 'MS-317-E', amount: 72, status: 'pending' },
];
const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const columns: TableColumn<Payout>[] = [
  { key: 'date', header: 'Date', isRowHeader: true },
  { key: 'plate', header: 'Vehicle' },
  { key: 'status', header: 'Status', render: (r) => (r.status === 'paid' ? <Badge status="success" label="Paid" /> : <Badge status="info" label="Pending" />) },
  { key: 'amount', header: 'Amount', align: 'end', render: (r) => eur.format(r.amount) },
];

const meta = {
  title: 'Components/Page',
  component: Page,
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div className="bg-subtle px-4 py-10 sm:px-8"><Story /></div>],
  args: {
    eyebrow: 'Account',
    title: 'Payouts',
    description: 'What we paid you for your vehicles’ quota, and how you want the next payout.',
    children: null,
  },
} satisfies Meta<typeof Page>;
export default meta;
type Story = StoryObj<typeof meta>;

const maxWidth = (root: HTMLElement) => getComputedStyle(root.querySelector<HTMLElement>('[data-page-width]')!).maxWidth;

/** Lists, tables, overviews: `size/content-default`, 880. */
export const Default: Story = {
  args: {
    children: (
      <section aria-labelledby="past" className="flex flex-col gap-4">
        <h2 id="past" className="m-0 type-desktop-header-card-strong text-primary">Past payouts</h2>
        <Table caption="Past payouts" hideCaption columns={columns} rows={payouts} getRowId={(r) => r.id} />
      </section>
    ),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    await expect(c.getByRole('heading', { level: 1, name: 'Payouts' })).toHaveAttribute('tabindex', '-1');
    await expect(maxWidth(canvasElement)).toBe('880px');
  },
};

/** One task: an upload, a short form, settings. `size/content-narrow`, 640. The S2 screen from build-run D. */
export const Narrow: Story = {
  name: 'Narrow: one task',
  args: {
    eyebrow: 'Vehicle VW-204-E',
    title: 'Upload your registration certificate',
    description: 'We need it once per vehicle to include it in this year’s quota.',
    width: 'narrow',
    children: (
      <FileUpload
        label="Registration certificate"
        description="Front of Part I. JPG, PNG or PDF, up to 10 MB."
        accept="image/jpeg,image/png,application/pdf"
        capture
        file={{ name: 'registration-certificate-front.jpg', sizeBytes: 2516582 }}
        status="error"
        error="We couldn’t read this photo: it’s too dark. Take it again in daylight, with all four corners visible."
        onSelect={() => {}}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    await expect(maxWidth(canvasElement)).toBe('640px');
  },
};

/** `notices` is for the whole page. A problem with one field or file stays on that field. */
export const WithNotice: Story = {
  name: 'With a page notice and actions',
  args: {
    actions: <Button variant="ghost" size="sm" label="Download statement" />,
    notices: (
      <Banner status="info" title="The 2026 quota year closes on 28 February">
        Payouts for applications sent after that date go into the 2027 batch.
      </Banner>
    ),
    children: <Table caption="Past payouts" columns={columns} rows={payouts} getRowId={(r) => r.id} />,
  },
};

function Vehicles() {
  const title = useRef<HTMLHeadingElement>(null);
  const [plates, setPlates] = useState(['VW-204-E', 'KL-880-E']);
  const [removed, setRemoved] = useState<string | null>(null);
  return (
    <Page
      eyebrow="Account"
      title="Your vehicles"
      titleRef={title}
      notices={
        removed && <Banner status="success" title={`${removed} removed from your account`}>Its open application for 2026 is withdrawn.</Banner>
      }
    >
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {plates.map((p) => (
          <li key={p} className="flex items-center justify-between rounded-container border border-subtle bg-surface p-4">
            <span className="type-desktop-body-caption-strong text-primary">{p}</span>
            <Button
              variant="ghost"
              tone="destructive"
              size="sm"
              label="Remove"
              aria-label={`Remove ${p}`}
              onClick={() => {
                setPlates((xs) => xs.filter((x) => x !== p));
                setRemoved(p);
                // The row and its button are gone: move focus to the page title.
                requestAnimationFrame(() => title.current?.focus());
              }}
            />
          </li>
        ))}
      </ul>
    </Page>
  );
}

/** `titleRef`: when the focused element disappears, focus goes to the title, not to the top of the document. */
export const FocusAfterRemoval: Story = {
  name: 'Focus to the title after a removal',
  render: () => <Vehicles />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Remove KL-880-E' }));
    const notice = await c.findByText('KL-880-E removed from your account');
    // The notices slot is a live region that was on the page before the Banner: it gets announced.
    await expect(notice.closest('[aria-live="polite"]')).not.toBeNull();
    await waitFor(() => expect(c.getByRole('heading', { level: 1, name: 'Your vehicles' })).toHaveFocus());
  },
};

export const Mobile: Story = {
  ...WithNotice,
  name: 'Mobile',
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
