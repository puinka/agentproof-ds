import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SiteHeader } from './SiteHeader';

const individuals = { audience: 'individuals' as const, items: [{ label: 'Knowledge', href: '/knowledge' }, { label: 'Blog', href: '/blog', current: true }, { label: 'Contact', href: '/contact' }], cta: { label: 'Register now', href: '/register' } };
const businesses = { audience: 'businesses' as const, items: [{ label: 'E-mobility', href: '/b/e-mobility' }, { label: 'Biomethane', href: '/b/biomethane' }, { label: 'Knowledge', href: '/b/knowledge' }, { label: 'Blog', href: '/b/blog' }, { label: 'Contact', href: '/b/contact' }], cta: { label: 'Book a call', href: '/b/call' } };

const meta = {
  title: 'Patterns/Site header',
  component: SiteHeader,
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  args: individuals,
  decorators: [(S) => <div><S /><main id="main" className="p-6 type-desktop-body-paragraph-default text-secondary">Page content</main></div>],
} satisfies Meta<typeof SiteHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Individuals: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('link', { name: 'For individuals' })).toHaveAttribute('aria-current', 'page');
    await expect(c.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    // Skip link is the first stop in the tab order (N-R1).
    await userEvent.tab();
    await expect(c.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
  },
};
export const Businesses: Story = { args: businesses };
export const Dark: Story = {
  args: { surface: 'dark' },
  decorators: [(S) => <div className="bg-inverse min-h-[200px]"><S /></div>],
};
export const Elevated: Story = { name: 'Elevated (sticky, scrolled)', args: { elevated: true, surface: 'dark' } };
export const MobileMenu: Story = {
  name: 'Mobile menu (Esc closes, focus returns)',
  decorators: [(S) => <div className="w-[390px] border border-subtle"><S /></div>],
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const btn = c.getByRole('button', { name: 'Menu' });
    if (!btn.checkVisibility()) return; // desktop-width canvas: nothing to test here
    await userEvent.click(btn);
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByRole('navigation', { name: 'Audience' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toHaveFocus();
  },
};
