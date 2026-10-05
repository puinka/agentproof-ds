import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { IsoGrid, ISO_CELL } from './IsoGrid';

const meta = { title: 'Foundations/Iso grid', component: IsoGrid, tags: ['!autodocs'], parameters: { layout: 'padded' } } satisfies Meta<typeof IsoGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The lattice, fading out from its focus. The play test checks that the numbers in the component
 * still match the role tokens `size/iso-cell-w` and `size/iso-cell-h`.
 */
export const Radial: Story = {
  render: (args) => (
    <div className="relative h-[420px] w-[960px] overflow-hidden rounded-container border border-subtle bg-subtle">
      <IsoGrid {...args} />
      <span className="absolute left-6 top-6 type-desktop-body-eyebrow text-tertiary">[ Iso grid · 56 × 32 ]</span>
    </div>
  ),
  args: { fade: 'radial', focus: { x: '50%', y: '50%' }, radius: '60%' },
  play: async () => {
    const css = getComputedStyle(document.documentElement);
    await expect(parseFloat(css.getPropertyValue('--size-iso-cell-w'))).toBe(ISO_CELL.w);
    await expect(parseFloat(css.getPropertyValue('--size-iso-cell-h'))).toBe(ISO_CELL.h);
  },
};

export const Even: Story = { ...Radial, args: { fade: 'none' } };
