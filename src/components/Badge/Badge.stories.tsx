import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = { title: 'Components/Badge', component: Badge, tags: ['!autodocs'], args: { label: 'Paid out', status: 'success' } } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};
export const All: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge status="neutral" label="Draft" />
      <Badge status="info" label="In review" />
      <Badge status="success" label="Paid out" />
      <Badge status="warning" label="Action needed" />
      <Badge status="error" label="Rejected" />
    </div>
  ),
};
