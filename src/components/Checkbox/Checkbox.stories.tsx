import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['!autodocs'],
  args: { label: 'Send me updates about my bonus' },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const cb = within(canvasElement).getByRole('checkbox', { name: 'Send me updates about my bonus' });
    await userEvent.click(within(canvasElement).getByText('Send me updates about my bonus'));
    await expect(cb).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(cb).not.toBeChecked();
  },
};
export const Checked: Story = { args: { defaultChecked: true } };
export const WithDescription: Story = { args: { description: 'About once a month. Unsubscribe any time.' } };
export const Indeterminate: Story = {
  args: { label: 'Select all vehicles', indeterminate: true },
  play: async ({ canvasElement }) => {
    const cb = within(canvasElement).getByRole('checkbox') as HTMLInputElement;
    await expect(cb.indeterminate).toBe(true);
  },
};
export const Error: Story = { args: { label: 'I agree to the terms and conditions', error: 'Agree to the terms to continue.' } };
export const Disabled: Story = { args: { isDisabled: true } };
export const Group: Story = {
  name: 'Group with legend (C-R4)',
  render: () => (
    <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
      <legend className="type-desktop-body-caption-strong text-primary mb-3">Vehicle types you own</legend>
      <Checkbox label="Electric car" defaultChecked />
      <Checkbox label="Electric van" />
      <Checkbox label="Electric motorbike" />
    </fieldset>
  ),
};
