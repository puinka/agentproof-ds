import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Stepper } from './Stepper';

const steps = ['Account', 'Vehicle', 'Documents', 'Payout'];
const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['!autodocs'],
  args: { steps, current: 1 },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div className="w-[768px]"><S /></div>],
} satisfies Meta<typeof Stepper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SecondStep: Story = {
  play: async ({ canvasElement }) => {
    const current = canvasElement.querySelector('[aria-current="step"]');
    await expect(current).toHaveTextContent('Step 2 of 4: Vehicle');
    await expect(within(canvasElement).getByText(/completed/)).toBeInTheDocument();
  },
};
export const FirstStep: Story = { args: { current: 0 } };
export const LastStep: Story = { args: { current: 3 } };
export const FiveSteps: Story = { args: { steps: [...steps, 'Done'], current: 2 } };
export const Narrow: Story = {
  name: 'Narrow container (compact form)',
  decorators: [(S) => <div className="w-[343px]"><S /></div>],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Step 2 of 4: Vehicle')).toBeVisible();
  },
};
