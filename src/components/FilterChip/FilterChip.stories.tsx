import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { FilterChip } from './FilterChip';

const meta = { title: 'Components/Filter chip', component: FilterChip, tags: ['!autodocs'], args: { label: 'Taxes' } } satisfies Meta<typeof FilterChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const Group: Story = {
  render: () => {
    const topics = ['All', 'GHG quota basics', 'Taxes', 'Vehicle classes', 'Fleet'];
    const [on, setOn] = useState('All');
    return (
      <div role="group" aria-label="Filter articles by topic" className="flex flex-wrap gap-2">
        {topics.map((t) => <FilterChip key={t} label={t} selected={on === t} onClick={() => setOn(t)} />)}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Taxes' }));
    await expect(c.getByRole('button', { name: 'Taxes' })).toHaveAttribute('aria-pressed', 'true');
    await expect(c.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
  },
};
