import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Table, type TableColumn } from './Table';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';

interface Application {
  id: string;
  plate: string;
  year: number;
  submitted: string; // ISO date
  status: 'paid' | 'review' | 'action';
  bonus: number | null;
}

const rows: Application[] = [
  { id: 'a1', plate: 'VW-204-E', year: 2026, submitted: '2026-01-14', status: 'review', bonus: null },
  { id: 'a2', plate: 'KL-880-E', year: 2025, submitted: '2025-02-02', status: 'paid', bonus: 110 },
  { id: 'a3', plate: 'VW-204-E', year: 2025, submitted: '2025-01-21', status: 'paid', bonus: 85 },
  { id: 'a4', plate: 'MS-317-E', year: 2026, submitted: '2026-02-03', status: 'action', bonus: null },
];

const statusUi = {
  paid: <Badge status="success" label="Paid" />,
  review: <Badge status="info" label="In review" />,
  action: <Badge status="warning" label="Needs action" />,
};
const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const columns: TableColumn<Application>[] = [
  { key: 'plate', header: 'Vehicle', isRowHeader: true, sortable: true },
  { key: 'year', header: 'Quota year', sortable: true },
  { key: 'submitted', header: 'Submitted', render: (r) => date.format(new Date(r.submitted)), sortable: true },
  { key: 'status', header: 'Status', render: (r) => statusUi[r.status] },
  { key: 'bonus', header: 'Bonus', align: 'end', sortable: true, sortValue: (r) => r.bonus ?? -1, render: (r) => (r.bonus == null ? '—' : eur.format(r.bonus)) },
  {
    key: 'actions', header: 'Actions', hideHeader: true, align: 'end',
    render: (r) => <Button size="sm" variant="ghost" label="View" aria-label={`View ${r.plate}, ${r.year}`} />,
  },
];

const meta = {
  title: 'Components/Table',
  component: Table<Application>,
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  args: { caption: 'Your quota applications', columns, rows, getRowId: (r: Application) => r.id },
} satisfies Meta<typeof Table<Application>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const table = c.getByRole('table', { name: 'Your quota applications' });
    // Each row is named by its row header.
    await expect(within(table).getAllByRole('rowheader')).toHaveLength(4);
    // The scroll frame is focusable and named by the caption.
    await expect(c.getByRole('region', { name: 'Your quota applications' })).toHaveAttribute('tabindex', '0');
  },
};

export const Sortable: Story = {
  name: 'Sorting',
  args: { defaultSort: { key: 'submitted', direction: 'descending' } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const header = () => c.getByRole('columnheader', { name: /Bonus/ });
    await expect(header()).toHaveAttribute('aria-sort', 'none');
    await expect(c.getByRole('columnheader', { name: /Submitted/ })).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(within(header()).getByRole('button'));
    await expect(header()).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(within(header()).getByRole('button'));
    await expect(header()).toHaveAttribute('aria-sort', 'descending');
    const firstRow = c.getAllByRole('row')[1];
    await expect(firstRow).toHaveTextContent('€110');
    await expect(c.getByText('Sorted by Bonus, descending')).toBeInTheDocument();
  },
};

export const Compact: Story = { args: { density: 'compact' } };

export const Empty: Story = {
  args: {
    rows: [],
    emptyState: 'No applications yet. Add a vehicle to apply for this year’s quota.',
  },
};

export const Mobile: Story = {
  name: 'Mobile (scrolls sideways)',
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region');
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
  },
};
