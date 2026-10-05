import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['!autodocs'],
  args: { label: 'Email me when my bonus is paid out', onCheckedChange: fn() },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  play: async ({ canvasElement, args }) => {
    const sw = within(canvasElement).getByRole('switch', { name: 'Email me when my bonus is paid out' });
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sw);
    await expect(sw).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    await userEvent.keyboard(' ');
    await expect(sw).toHaveAttribute('aria-checked', 'false');
  },
};
export const On: Story = { args: { defaultChecked: true } };
export const WithDescription: Story = { args: { description: 'One email per payout. No marketing.' } };
export const LabelStart: Story = { args: { labelPosition: 'start' } };
export const Disabled: Story = { args: { isDisabled: true } };
