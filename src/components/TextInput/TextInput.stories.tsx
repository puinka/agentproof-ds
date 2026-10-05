import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Field } from '../Field/Field';
import { TextInput } from './TextInput';
import { Icon } from '../../icons/Icon';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Text field',
  component: Field,
  tags: ['!autodocs'],
  args: { label: 'Email address', children: null },
  argTypes: { children: { control: false } },
  decorators: [(S) => <div className="w-[344px]"><S /></div>],
  render: (args) => (
    <Field {...args}>
      <TextInput type="email" placeholder="name@example.com" autoComplete="email" />
    </Field>
  ),
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Clicking the label focuses the input: the label is programmatically tied to it.
    await userEvent.click(c.getByText('Email address'));
    await expect(c.getByRole('textbox', { name: 'Email address' })).toHaveFocus();
  },
};

export const WithDescription: Story = {
  args: { label: 'Licence plate', description: 'As printed on your vehicle registration.' },
  render: (args) => <Field {...args}><TextInput placeholder="AB-CD 1234" /></Field>,
};

export const Error: Story = {
  args: { status: 'error', message: 'Enter an email address like name@example.com.' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Enter an email address like name@example.com.');
  },
};

export const Warning: Story = {
  args: { status: 'warning', message: 'This address has bounced before. Check it is correct.' },
};

export const Success: Story = {
  args: { status: 'success', message: 'Email address confirmed.' },
};

export const Optional: Story = {
  args: { label: 'Company name', isOptional: true },
  render: (args) => <Field {...args}><TextInput autoComplete="organization" /></Field>,
};

export const Disabled: Story = { args: { isDisabled: true } };

export const WithIcon: Story = {
  args: { label: 'Search' },
  render: (args) => <Field {...args}><TextInput type="search" icon={<Icon name="information-circle" />} placeholder="Search the help centre" /></Field>,
};

export const InRowWithButton: Story = {
  name: 'In a row with a button (same 48 px height)',
  parameters: { layout: 'padded' },
  decorators: [(S) => <div className="w-[520px]"><S /></div>],
  render: () => (
    <div className="flex items-end gap-3">
      <Field label="Newsletter" className="flex-1"><TextInput type="email" placeholder="Your email address" /></Field>
      <Button label="Subscribe" />
    </div>
  ),
};
