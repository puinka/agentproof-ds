import type { Meta, StoryObj } from '@storybook/react-vite';
import tokens from '../../tokens/figma-variables.json';

type Pair = [string, string | number];
const base = new Map((tokens.collections.find((c) => c.name === 'Base / Color')!.vars as Pair[]).map(([n, v]) => [n, String(v)]));
const semantic = tokens.collections.find((c) => c.name === 'Semantic / Color')!.vars as Pair[];
const resolve = (v: string) => (v.startsWith('@') ? base.get(v.slice(1))! : v);

function SemanticTable({ group }: { group: 'text' | 'background' | 'border' }) {
  const rows = semantic.filter(([n]) => n.startsWith(group + '/'));
  return (
    <table className="type-desktop-body-caption-default text-primary border-collapse w-full">
      <thead>
        <tr className="text-left text-secondary">
          <th className="py-2 pr-4">Token</th><th className="py-2 pr-4">Swatch</th><th className="py-2 pr-4">Alias</th><th className="py-2">CSS variable</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([n, v]) => (
          <tr key={n} className="border-t border-subtle">
            <td className="py-2 pr-4 font-mono">{n}</td>
            <td className="py-2 pr-4">
              <span className="inline-block size-8 rounded-lg border border-subtle" style={{ background: `var(--color-${n.replace('/', '-')})` }} />
            </td>
            <td className="py-2 pr-4 font-mono text-tertiary">{String(v).replace('@', '')} · {resolve(String(v))}</td>
            <td className="py-2 font-mono text-tertiary">--color-{n.replace('/', '-')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const meta = { title: 'Foundations/Colors', parameters: { layout: 'padded' }, tags: ['!autodocs'] } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** Generated from the Figma export. UI binds semantic roles only (design.md §2.4). */
export const Text: Story = { render: () => <SemanticTable group="text" /> };
export const Background: Story = { render: () => <SemanticTable group="background" /> };
export const Border: Story = { render: () => <SemanticTable group="border" /> };
