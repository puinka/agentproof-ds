import { useState, type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Form } from './Form';
import { RadioList } from '../RadioList/RadioList';
import { Field } from '../Field/Field';
import { TextInput } from '../TextInput/TextInput';
import { Checkbox } from '../Checkbox/Checkbox';
import { Button } from '../Button/Button';
import { Banner, BannerRegion } from '../Banner/Banner';

const payout = [
  { value: 'fixed', label: 'Fixed bonus', description: 'Paid within 4 weeks. The amount is guaranteed.', meta: '€85' },
  { value: 'market', label: 'Market price', description: 'Paid after the sale in spring. Last year: €72–€110.', meta: 'from €72' },
];

const meta = {
  title: 'Components/Form',
  component: Form,
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-content-narrow"><Story /></div>],
} satisfies Meta<typeof Form>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The S3 case from build-run D: one required choice, submitted empty. */
function PayoutChoice() {
  const [choice, setChoice] = useState<string>();
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!choice) return setError('Choose how you want your next payout.');
    setError(undefined);
    setSaved(true);
  };
  return (
    <div className="flex flex-col gap-6">
      <BannerRegion>
        {saved && <Banner status="success" title="Payout choice saved">We’ll pay your next bonus this way.</Banner>}
      </BannerRegion>
      <Form onSubmit={submit} className="flex flex-col gap-6">
        <RadioList
          legend="How do you want your next payout?"
          layout="tiles"
          options={payout}
          value={choice}
          onChange={(v) => { setChoice(v); setError(undefined); setSaved(false); }}
          error={error}
          isRequired
        />
        <div><Button type="submit" label="Save payout choice" /></div>
      </Form>
    </div>
  );
}

export const EmptySubmit: Story = {
  name: 'One choice, submitted empty',
  render: () => <PayoutChoice />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole('radiogroup', { name: 'How do you want your next payout?' });
    // The live region is there before the error, so the error is announced when it appears.
    const live = group.querySelector('[aria-live="polite"]');
    await expect(live).not.toBeNull();
    await expect(live).toBeEmptyDOMElement();
    await userEvent.click(c.getByRole('button', { name: 'Save payout choice' }));
    await expect(live).toHaveTextContent('Choose how you want your next payout.');
    await expect(group).toHaveAttribute('aria-invalid', 'true');
    // Focus lands on the first option of the invalid group.
    await waitFor(() => expect(c.getByRole('radio', { name: /Fixed bonus/ })).toHaveFocus());
    // Choosing clears the error.
    await userEvent.click(c.getByRole('radio', { name: /Market price/ }));
    await expect(live).toBeEmptyDOMElement();
    await userEvent.click(c.getByRole('button', { name: 'Save payout choice' }));
    await expect(await c.findByText('Payout choice saved')).toBeInTheDocument();
  },
};

/** Several fields: a summary at the top lists the problems, and focus goes to the first one. */
function Contact() {
  const [email, setEmail] = useState('');
  const [vehicle, setVehicle] = useState<string>();
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter an email address like name@example.com.';
    if (!vehicle) next.vehicle = 'Choose your vehicle type.';
    if (!terms) next.terms = 'Confirm that the vehicle is registered in your name.';
    setErrors(next);
  };
  const list = Object.values(errors);
  return (
    <Form onSubmit={submit} className="flex flex-col gap-6">
      <BannerRegion>
        {list.length > 1 && (
          <Banner status="error" title={`${list.length} things to fix before we can save`}>
            <ul className="m-0 pl-5">{list.map((m) => <li key={m}>{m}</li>)}</ul>
          </Banner>
        )}
      </BannerRegion>
      <Field label="Email" status={errors.email ? 'error' : 'none'} message={errors.email} isRequired>
        <TextInput type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <RadioList
        legend="Vehicle type"
        options={[{ value: 'car', label: 'Electric car' }, { value: 'van', label: 'Electric van' }]}
        value={vehicle}
        onChange={setVehicle}
        error={errors.vehicle}
        isRequired
      />
      <Checkbox label="The vehicle is registered in my name" checked={terms} onChange={(e) => setTerms(e.target.checked)} error={errors.terms} />
      <div><Button type="submit" label="Save" /></div>
    </Form>
  );
}

export const SeveralErrors: Story = {
  name: 'Several fields, error summary',
  render: () => <Contact />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Save' }));
    await expect(await c.findByText('3 things to fix before we can save')).toBeInTheDocument();
    await waitFor(() => expect(c.getByRole('textbox', { name: /Email/ })).toHaveFocus());
    await expect(c.getByRole('textbox', { name: /Email/ })).toHaveAccessibleDescription('Enter an email address like name@example.com.');
  },
};

export const Mobile: Story = {
  ...EmptySubmit,
  name: 'Mobile',
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
