import { useId } from 'react';

/**
 * Isometric lattice: the brand's background grid (2026-10-05). Lines at ±30° and vertical, a dot at every
 * crossing. It echoes the isometric illustrations and stands for the energy grid.
 *
 * Use it in marketing heroes, flow diagrams and empty states. Never behind product UI or body text.
 * Cell size mirrors the role tokens `size/iso-cell-w` (56) and `size/iso-cell-h` (32); SVG pattern
 * attributes cannot read CSS variables, so the numbers are repeated here and checked in IsoGrid.stories.
 */
export const ISO_CELL = { w: 56, h: 32 } as const;
/** Slope of the lattice lines (tan 30° ≈ 32 / 56). Wires that follow the lattice use it. */
export const ISO_SLOPE = ISO_CELL.h / ISO_CELL.w;

export interface IsoGridProps {
  /** `radial` fades the lattice out from `focus`; `none` fills the whole area evenly. */
  fade?: 'radial' | 'none';
  /** Centre of the fade, as CSS-like percentages of the area. */
  focus?: { x: string; y: string };
  /** Radius of the fully visible area, as a percentage of the area. */
  radius?: string;
  className?: string;
}

export function IsoGrid({ fade = 'radial', focus = { x: '50%', y: '50%' }, radius = '60%', className = '' }: IsoGridProps) {
  const id = useId().replace(/:/g, '');
  const { w, h } = ISO_CELL;
  return (
    <svg className={`pointer-events-none absolute inset-0 size-full ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <pattern id={`iso-${id}`} width={w} height={h} patternUnits="userSpaceOnUse">
          <path d={`M0 0 L${w} ${h} M0 ${h} L${w} 0 M${w / 2} 0 V${h}`} className="stroke-[color:var(--color-border-default)]" strokeWidth={1} fill="none" />
          {[[0, 0], [w, 0], [0, h], [w, h], [w / 2, h / 2]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={1.4} className="fill-[color:var(--color-icon-disabled)]" />
          ))}
        </pattern>
        <radialGradient id={`fade-${id}`} cx={focus.x} cy={focus.y} r={radius}>
          <stop offset="0.3" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={`mask-${id}`}>
          <rect width="100%" height="100%" fill={fade === 'radial' ? `url(#fade-${id})` : '#fff'} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#iso-${id})`} mask={`url(#mask-${id})`} />
    </svg>
  );
}

type Move = readonly ['h' | 'v', number] | readonly ['d', number, 1 | -1];

/**
 * Builds an SVG path that only moves the way the lattice does: horizontal stubs, vertical runs and
 * 30° diagonals (`['d', dx, 1]` goes down-right for dx > 0, `-1` goes up). Returns the end point too.
 */
export function isoRoute(x: number, y: number, moves: Move[]) {
  let d = `M ${x} ${y}`;
  for (const m of moves) {
    if (m[0] === 'h') x += m[1];
    else if (m[0] === 'v') y += m[1];
    else { const [, dx, dir] = m as readonly ['d', number, 1 | -1]; x += dx; y += Math.abs(dx) * ISO_SLOPE * dir; }
    d += ` L ${round(x)} ${round(y)}`;
  }
  return { d, end: [round(x), round(y)] as const };
}
const round = (n: number) => Math.round(n * 10) / 10;

/**
 * A wire on the lattice: a thin cobalt line with a lime pulse travelling along it.
 * The pulse stops when the user asks for reduced motion; the line stays.
 */
export function PulseWire({ d, delay = 0, animated = true }: { d: string; delay?: number; animated?: boolean }) {
  return (
    <g>
      <path d={d} fill="none" className="stroke-[color:var(--color-text-accent)]" strokeOpacity={0.45} strokeWidth={1.25} />
      {animated && (
        <path d={d} fill="none" className="iso-pulse stroke-[color:var(--color-background-highlight)]" strokeWidth={3} strokeLinecap="round" style={{ animationDelay: `${delay}s` }} />
      )}
    </g>
  );
}

/** Keyframes for PulseWire; render once inside any SVG that uses it. */
export const pulseCss =
  '@keyframes iso-pulse{to{stroke-dashoffset:-260}}' +
  '.iso-pulse{stroke-dasharray:16 244;animation:iso-pulse 3.4s linear infinite}' +
  '@media (prefers-reduced-motion: reduce){.iso-pulse{animation:none;stroke-dasharray:none;opacity:0}}';
