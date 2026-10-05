import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { Icon } from '../../icons/Icon';

const meta = { title: 'Components/Card', component: Card, tags: ['!autodocs'], args: { children: null }, parameters: { layout: 'padded' } } satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Figma `Type=Feature card`. */
export const FeatureCard: Story = {
  render: () => (
    <Card className="w-[320px]">
      <span className="icon-primary" aria-hidden="true"><Icon name="check-circle" /></span>
      <h3 className="m-0 type-desktop-header-card-strong text-primary">Guaranteed payout</h3>
      <p className="m-0 type-desktop-body-caption-default text-secondary">Your payout is guaranteed by contract, so you can count on your money.</p>
      <Button variant="ghost" size="sm" label="Learn more" className="self-start" />
    </Card>
  ),
};

/** Figma `Type=CTA`: brand tone, the action uses `onDark` (no Primary on brand blue, design.md G22). */
export const CTACard: Story = {
  render: () => (
    <Card tone="accent" padding="spacious" className="w-[320px] items-center text-center">
      <h3 className="m-0 type-desktop-header-card-strong text-inverse">Apply for your GHG bonus</h3>
      <p className="m-0 type-desktop-body-caption-default text-on-accent">Secure your yearly bonus quickly and easily, fully online.</p>
      <Button variant="ghost" onDark size="sm" label="Claim your bonus" />
    </Card>
  ),
};

/** Figma `Type=Article`. The whole card is the link, so there is no nested button. */
export const ArticleCard: Story = {
  render: () => (
    <Card elevation="md" padding="none" className="w-[320px]">
      <div className="h-40 bg-accent-muted" role="img" aria-label="Electric car charging at home" />
      <div className="flex flex-col gap-2 p-6">
        <Badge status="neutral" label="Fleet" />
        <h3 className="m-0 type-desktop-header-card-strong">
          <a href="#article" className="text-primary no-underline hover:underline focus-visible:shadow-focus outline-none">Digital fleet management: save time and money</a>
        </h3>
        <p className="m-0 type-desktop-body-caption-default text-tertiary">May 10, 2025</p>
      </div>
    </Card>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(['surface', 'muted', 'accent', 'accent-strong'] as const).map((t) => (
        <Card key={t} tone={t} className="w-[200px]"><p className="m-0 type-desktop-body-caption-strong">tone="{t}"</p></Card>
      ))}
    </div>
  ),
};
