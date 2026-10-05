import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Dialog, type DialogProps } from './Dialog';
import { Button } from '../Button/Button';
import { Field } from '../Field/Field';
import { TextInput } from '../TextInput/TextInput';

/** Every story renders the trigger too: focus return and Esc can only be tested from a real opener. */
function WithTrigger({ trigger, startOpen = false, ...props }: Omit<DialogProps, 'open' | 'onClose'> & { trigger: string; startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const [result, setResult] = useState('');
  return (
    <div className="flex min-h-[420px] flex-col items-start gap-3">
      <Button variant="ghost" tone={props.tone} label={trigger} onClick={() => setOpen(true)} />
      <p className="m-0 type-desktop-body-caption-default text-tertiary" aria-live="polite">{result}</p>
      <Dialog
        {...props}
        open={open}
        onClose={() => { setOpen(false); setResult('Closed without changes.'); }}
        primaryAction={{ ...props.primaryAction, onClick: () => { setOpen(false); setResult(`Done: ${props.primaryAction.label}.`); } }}
        onSubmit={props.onSubmit && ((data) => { setOpen(false); setResult(`Saved: ${[...data.values()].join(', ')}.`); })}
      />
    </div>
  );
}

const meta = {
  title: 'Components/Dialog',
  component: WithTrigger,
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WithTrigger>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmDestructive: Story = {
  name: 'Confirm, destructive',
  args: {
    trigger: 'Withdraw application',
    tone: 'destructive',
    title: 'Withdraw this application?',
    description: 'We stop selling the 2026 quota for VW-204-E. You can apply again until 28 February, but your place in this year’s batch is lost.',
    primaryAction: { label: 'Withdraw application' },
    secondaryLabel: 'Keep application',
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const trigger = c.getByRole('button', { name: 'Withdraw application' });
    await userEvent.click(trigger);
    const dialog = await c.findByRole('dialog', { name: 'Withdraw this application?' });
    // Focus starts on the safe action.
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Keep application' })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    // Focus returns to the opener.
    await expect(trigger).toHaveFocus();
  },
};

export const Info: Story = {
  args: {
    trigger: 'How is the bonus calculated?',
    title: 'How the bonus is calculated',
    description: (
      <p>
        Your bonus depends on the quota price when we sell your certificate. The fixed option pays a known amount now; the market option
        pays later and can be higher or lower.
      </p>
    ),
    primaryAction: { label: 'Got it' },
    secondaryLabel: 'Close',
    hideCloseButton: true,
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'How is the bonus calculated?' }));
    const dialog = await c.findByRole('dialog', { name: 'How the bonus is calculated' });
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Got it' })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    await expect(c.getByText('Done: Got it.')).toBeInTheDocument();
  },
};

export const WithForm: Story = {
  name: 'With a form',
  args: {
    trigger: 'Add a vehicle',
    title: 'Add a vehicle',
    description: 'Use the details from your registration certificate.',
    size: 'md',
    primaryAction: { label: 'Add vehicle' },
    onSubmit: () => {},
    children: (
      <>
        <Field label="Licence plate" isRequired>
          <TextInput name="plate" autoComplete="off" required />
        </Field>
        <Field label="Vehicle nickname" isOptional description="Shown in your dashboard only.">
          <TextInput name="nickname" autoComplete="off" />
        </Field>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Add a vehicle' }));
    const dialog = await c.findByRole('dialog', { name: 'Add a vehicle' });
    const plate = within(dialog).getByRole('textbox', { name: /Licence plate/ });
    // Focus starts on the first field.
    await waitFor(() => expect(plate).toHaveFocus());
    await userEvent.type(plate, 'VW-204-E{Enter}');
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    await expect(c.getByText(/Saved: VW-204-E/)).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  name: 'Mobile (actions stack)',
  args: { ...ConfirmDestructive.args!, startOpen: false } as Story['args'],
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Withdraw application' }));
    const dialog = await c.findByRole('dialog');
    const [safe, primary] = within(dialog).getAllByRole('button').filter((b) => b.textContent !== '');
    // At phone width the primary action sits above the safe one; both are full width.
    await waitFor(() => expect(primary.getBoundingClientRect().top).toBeLessThan(safe.getBoundingClientRect().top));
  },
};
