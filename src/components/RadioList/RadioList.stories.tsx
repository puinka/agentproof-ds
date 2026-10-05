import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RadioList } from './RadioList';

const vehicles = [
  { value: 'car', label: 'Electric car' },
  { value: 'van', label: 'Electric van', description: 'Up to 3.5 t. Heavier vehicles: contact us.' },
  { value: 'bike', label: 'Electric motorbike' },
];

const payout = [
  { value: 'fixed', label: 'Fixed bonus', description: 'Paid within 4 weeks. The amount is guaranteed.', meta: '€85' },
  { value: 'market', label: 'Market price', description: 'Paid after the sale in spring. Last year: €72–€110.', meta: 'from €72' },
];

const meta = {
  title: 'Components/Radio list',
  component: RadioList,
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  args: { legend: 'Vehicle type', options: vehicles },
  decorators: [(Story) => <div className="max-w-[640px]"><Story /></div>],
} satisfies Meta<typeof RadioList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole('radiogroup', { name: 'Vehicle type' });
    const car = within(group).getByRole('radio', { name: 'Electric car' });
    await userEvent.click(c.getByText('Electric car'));
    await expect(car).toBeChecked();
    // Arrow keys move the choice inside the group.
    await userEvent.keyboard('{ArrowDown}');
    await expect(within(group).getByRole('radio', { name: 'Electric van' })).toBeChecked();
    await expect(car).not.toBeChecked();
  },
};

function TilesDemo() {
  const [value, setValue] = useState('fixed');
  return (
    <div className="flex flex-col gap-4">
      <RadioList
        legend="How do you want to be paid?"
        description="You can change this until we sell your quota."
        layout="tiles"
        options={payout}
        value={value}
        onChange={setValue}
      />
      <p className="m-0 type-desktop-body-caption-default text-tertiary" aria-live="polite">Selected: {value}</p>
    </div>
  );
}
export const Tiles: Story = {
  name: 'Tiles (selected option)',
  render: () => <TilesDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const market = c.getByRole('radio', { name: /Market price/ });
    await expect(c.getByRole('radio', { name: /Fixed bonus/ })).toBeChecked();
    await userEvent.click(c.getByText('Market price'));
    await expect(market).toBeChecked();
    await expect(c.getByText('Selected: market')).toBeInTheDocument();
    // The selected tile carries the accent border: state is shown by the dot and the border, not by colour alone.
    const tile = market.closest('label')!;
    const probe = Object.assign(document.createElement('div'), { className: 'border border-accent' });
    canvasElement.append(probe);
    await expect(getComputedStyle(tile).borderTopColor).toBe(getComputedStyle(probe).borderTopColor);
    probe.remove();
  },
};

export const WithError: Story = {
  name: 'Error',
  args: { legend: 'How do you want to be paid?', layout: 'tiles', options: payout, isRequired: true, error: 'Choose how you want to be paid.' },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('radiogroup');
    await expect(group).toHaveAttribute('aria-invalid', 'true');
    await expect(group).toHaveAccessibleDescription(/Choose how you want to be paid/);
  },
};

export const DisabledOption: Story = {
  name: 'Disabled option',
  args: {
    options: [...vehicles.slice(0, 2), { value: 'bike', label: 'Electric motorbike', description: 'Not eligible in 2026.', disabled: true }],
    defaultValue: 'car',
  },
};

export const TilesMobile: Story = {
  name: 'Tiles, mobile',
  args: { legend: 'How do you want to be paid?', layout: 'tiles', options: payout, defaultValue: 'fixed' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
