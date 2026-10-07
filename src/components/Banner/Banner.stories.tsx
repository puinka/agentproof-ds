import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Banner, BannerRegion } from './Banner';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Banner',
  component: Banner,
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  args: {
    status: 'info',
    title: 'The 2026 quota year closes on 28 February',
    children: 'Applications sent after that date go into the 2027 batch.',
  },
  decorators: [(Story) => <div className="max-w-content-narrow"><Story /></div>],
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const AllStatuses: Story = {
  name: 'All statuses',
  render: () => (
    <div className="flex flex-col gap-4">
      <Banner status="info" title="The 2026 quota year closes on 28 February">Applications sent after that date go into the 2027 batch.</Banner>
      <Banner status="success" title="Payment sent">We sent €85 to the account ending in 4031. It usually arrives in 2–3 working days.</Banner>
      <Banner status="warning" title="Your registration certificate expires soon">Upload the new one before 31 March, or we can’t include the vehicle in next year’s quota.</Banner>
      <Banner status="error" title="We couldn’t read your registration certificate">The photo is too dark. Take it again in daylight, with all four corners visible.</Banner>
    </div>
  ),
};

export const WithAction: Story = {
  name: 'With an action',
  args: {
    status: 'warning',
    title: 'Your registration certificate expires soon',
    children: 'Upload the new one before 31 March, or we can’t include the vehicle in next year’s quota.',
    action: <Button variant="link" label="Upload new certificate" />,
  },
};

function DismissDemo() {
  const [shown, setShown] = useState(true);
  return shown ? (
    <Banner status="info" title="New: pay-out to a business account" onDismiss={() => setShown(false)} dismissLabel="Dismiss: New pay-out option">
      Fleet owners can now receive the bonus on a company IBAN.
    </Banner>
  ) : (
    <p className="m-0 type-desktop-body-caption-default text-tertiary">Banner dismissed.</p>
  );
}
export const Dismissible: Story = {
  render: () => <DismissDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Dismiss: New pay-out option' }));
    await expect(c.getByText('Banner dismissed.')).toBeInTheDocument();
  },
};

function LiveDemo() {
  const [state, setState] = useState<'idle' | 'error'>('idle');
  return (
    <div className="flex flex-col items-start gap-4">
      <Button label="Send application" onClick={() => setState('error')} />
      {state === 'error' && (
        <Banner status="error" live="assertive" title="We couldn’t send your application">
          The connection dropped. Your answers are saved; try again in a moment.
        </Banner>
      )}
    </div>
  );
}
export const LiveError: Story = {
  name: 'Live error after an action',
  render: () => <LiveDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('alert')).toBeNull();
    await userEvent.click(c.getByRole('button', { name: 'Send application' }));
    await expect(await c.findByRole('alert')).toHaveTextContent('We couldn’t send your application');
  },
};

export const Static: Story = {
  name: 'Static (no live role)',
  play: async ({ canvasElement }) => {
    // A banner present on load must not interrupt: no alert or status role.
    const c = within(canvasElement);
    await expect(c.queryByRole('alert')).toBeNull();
    await expect(c.queryByRole('status')).toBeNull();
  },
};

function SavedDemo() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      {/* Rendered before anything happens; the Banner appears inside it. */}
      <BannerRegion className="w-full">
        {saved && <Banner status="success" title="Payout choice saved">We’ll pay your next bonus this way.</Banner>}
      </BannerRegion>
      <Button label="Save payout choice" onClick={() => setSaved(true)} />
    </div>
  );
}
/** The result of the user's action: a region that is already on the page, then the Banner inside it. */
export const ResultOfAnAction: Story = {
  name: 'Result of an action (BannerRegion)',
  render: () => <SavedDemo />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const region = canvasElement.querySelector('[aria-live="polite"]');
    await expect(region).toBeEmptyDOMElement();
    await userEvent.click(c.getByRole('button', { name: 'Save payout choice' }));
    await expect(region).toHaveTextContent('Payout choice saved');
  },
};
