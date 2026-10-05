import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';
import { Icon } from '../../icons/Icon';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['!autodocs'], // the docs page is Button.mdx
  args: { label: 'Save changes', onClick: fn() },
  argTypes: {
    icon: { control: false },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Ghost: Story = { args: { variant: 'ghost', label: 'Cancel' } };

export const Link: Story = { args: { variant: 'link', label: 'Learn more' } };

export const WithIcon: Story = {
  args: { label: 'Continue', icon: <Icon name="arrow-right" /> },
};

export const Destructive: Story = {
  name: 'Destructive (final confirmation)',
  args: { tone: 'destructive', label: 'Delete account', icon: <Icon name="trash" /> },
};

export const DestructiveGhost: Story = {
  name: 'Destructive ghost (one of several actions)',
  args: { tone: 'destructive', variant: 'ghost', label: 'Remove vehicle', icon: <Icon name="trash" /> },
};

export const Small: Story = {
  name: 'Size sm (dense rows only)',
  args: { size: 'sm', label: 'Edit' },
};

export const Disabled: Story = {
  name: 'Disabled (aria-disabled)',
  args: { isDisabled: true, label: 'Submit application' },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Submit application' });
    // B-R6: stays in the tab order, is announced as unavailable, ignores clicks.
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).not.toHaveAttribute('disabled');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    button.blur();
    await userEvent.tab();
    await expect(button).toHaveFocus(); // still reachable by keyboard
  },
};

export const Loading: Story = {
  args: { isLoading: true, label: 'Saving' },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Saving' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const OnDark: Story = {
  name: 'On dark background',
  args: { variant: 'ghost', onDark: true, label: 'Contact sales' },
  decorators: [
    (S) => (
      <div className="bg-inverse p-8 rounded-3xl flex gap-6 items-center">
        <S />
        <Button variant="link" onDark label="See pricing" />
      </div>
    ),
  ],
};

export const KeyboardFocus: Story = {
  name: 'Keyboard focus',
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

/** Every supported combination on one canvas, for visual review against Figma. */
export const Matrix: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const variants = ['primary', 'ghost', 'link'] as const;
    return (
      <div className="grid gap-6">
        {variants.map((v) => (
          <div key={v} className="flex flex-wrap items-center gap-4">
            <span className="type-desktop-body-caption-strong text-tertiary w-20">{v}</span>
            <Button variant={v} label="Default" />
            {v !== 'link' && <Button variant={v} size="sm" label="Small" />}
            <Button variant={v} label="With icon" icon={<Icon name="arrow-right" />} />
            <Button variant={v} isDisabled label="Disabled" />
            {v !== 'link' && <Button variant={v} isLoading label="Loading" />}
            {v !== 'link' && <Button variant={v} tone="destructive" label="Delete" icon={<Icon name="trash" />} />}
          </div>
        ))}
      </div>
    );
  },
};
