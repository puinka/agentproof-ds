import type { ReactNode } from 'react';
import { IsoGrid, PulseWire, isoRoute, pulseCss, ISO_SLOPE } from '../IsoGrid/IsoGrid';

/**
 * Flow diagram: sources → hub → targets on the isometric lattice (Figma: pattern `Flow diagram`, planned).
 * Built from data so an agent can produce one from a list: give it 1–5 sources, 1–5 targets and the
 * hub's steps. Wires are drawn along the lattice and carry a lime pulse (still with reduced motion).
 *
 * - The meaning lives in the text, not in the wires: sources and targets are lists, steps are an ordered list.
 * - Below 760 px of container width the diagram stacks (sources, hub, targets) and drops the wires.
 * - Icons are decorative; give every node a title. Keep titles to 1–3 words, captions to one line.
 */
export interface FlowNode {
  id: string;
  title: string;
  caption?: string;
  /** Decorative, 48–76 px: an isometric tile or icon. */
  icon?: ReactNode;
}

export interface FlowDiagramProps {
  /** Mono label over the centre, e.g. "How the quota moves". */
  label?: string;
  sourcesLabel: string;
  targetsLabel: string;
  sources: FlowNode[];
  targets: FlowNode[];
  hub: { title: ReactNode; steps: string[]; caption?: string };
  animated?: boolean;
}

// Geometry (px). Rows are fixed so the wires can be computed; columns flex around fixed wire lanes.
const ROW = 88, GAP = 40, LANE = 168, STUB = 16, ENTRY_GAP = 36;

function lanePaths(n: number, side: 'in' | 'out') {
  const height = n * ROW + (n - 1) * GAP;
  const hubY = height / 2;
  const maxDy = (LANE - 2 * STUB) * ISO_SLOPE;
  return Array.from({ length: n }, (_, i) => {
    const nodeY = i * (ROW + GAP) + ROW / 2;
    const entryY = hubY + (i - (n - 1) / 2) * ENTRY_GAP;
    const dy = entryY - nodeY;
    const diagDy = Math.min(Math.abs(dy), maxDy);
    const dx = diagDy / ISO_SLOPE;
    const v = Math.abs(dy) - diagDy;
    const dir = (dy >= 0 ? 1 : -1) as 1 | -1;
    // Sources: node → hub. Targets: hub → node (same shape, drawn left to right so pulses flow outwards).
    const [y0, y1] = side === 'in' ? [nodeY, entryY] : [entryY, nodeY];
    const d0 = side === 'in' ? dir : ((-dir) as 1 | -1);
    const r = isoRoute(0, y0, [['h', STUB], ['d', dx, d0], ['v', v * d0], ['h', LANE - STUB - dx]]);
    return { ...r, y1, height };
  });
}

function Lane({ n, side, animated }: { n: number; side: 'in' | 'out'; animated: boolean }) {
  const paths = lanePaths(n, side);
  const height = paths[0]?.height ?? ROW;
  return (
    <svg width={LANE} height={height} className="hidden shrink-0 overflow-visible @3xl:block" aria-hidden="true" focusable="false">
      <style>{pulseCss}</style>
      {paths.map((p, i) => <PulseWire key={i} d={p.d} delay={-i * 0.9} animated={animated} />)}
    </svg>
  );
}

function NodeCard({ node, side }: { node: FlowNode; side: 'source' | 'target' }) {
  return (
    <li className={`flex h-[88px] items-center gap-4 ${side === 'source' ? '@3xl:flex-row-reverse @3xl:text-right' : ''}`}>
      <span className="flex size-[88px] shrink-0 items-center justify-center rounded-container border border-subtle bg-surface" aria-hidden="true">
        {node.icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="type-desktop-body-caption-strong text-primary">{node.title}</span>
        {node.caption && <span className="type-desktop-body-caption-default text-tertiary">{node.caption}</span>}
      </span>
    </li>
  );
}

export function FlowDiagram({ label, sourcesLabel, targetsLabel, sources, targets, hub, animated = true }: FlowDiagramProps) {
  if ((sources.length < 1 || sources.length > 5 || targets.length < 1 || targets.length > 5) && import.meta.env?.DEV)
    console.warn('[FlowDiagram] 1 to 5 sources and 1 to 5 targets.');
  const rows = Math.max(sources.length, targets.length);
  const minH = rows * ROW + (rows - 1) * GAP;
  return (
    <section className="@container relative overflow-hidden rounded-container border border-subtle bg-subtle" aria-label={label ?? `${sourcesLabel} to ${targetsLabel}`}>
      <IsoGrid focus={{ x: '50%', y: '55%' }} radius="55%" />
      <div className="relative flex flex-col gap-8 p-6 @3xl:p-8">
        <div className="flex justify-between gap-4 type-desktop-body-eyebrow text-tertiary">
          <span className="hidden @3xl:inline" aria-hidden="true">[ {sourcesLabel} ]</span>
          {label && <span>[ {label} ]</span>}
          <span className="hidden @3xl:inline" aria-hidden="true">[ {targetsLabel} ]</span>
        </div>
        <div className="flex flex-col gap-8 @3xl:flex-row @3xl:items-center @3xl:gap-0">
          <div className="flex flex-col gap-3 @3xl:flex-1">
            <p className="m-0 type-desktop-body-eyebrow text-tertiary @3xl:hidden" aria-hidden="true">[ {sourcesLabel} ]</p>
            <ul aria-label={sourcesLabel} className="m-0 flex list-none flex-col gap-4 p-0 @3xl:gap-10 @3xl:items-end">
              {sources.map((s) => <NodeCard key={s.id} node={s} side="source" />)}
            </ul>
          </div>
          <Lane n={sources.length} side="in" animated={animated} />
          <div className="flex shrink-0 flex-col items-center justify-center gap-5 rounded-container bg-accent p-6 text-center @3xl:w-[268px]" style={{ minHeight: Math.min(minH - 2 * ROW, 260) }}>
            <div className="text-inverse">{hub.title}</div>
            <ol aria-label="Steps" className="m-0 grid list-none grid-cols-2 gap-2 p-0">
              {hub.steps.map((s, i) => (
                <li key={s} className="rounded-small border border-[color:var(--color-background-inverse-muted)] px-3 py-1.5 type-desktop-body-eyebrow text-on-accent">
                  <span className="sr-only">Step {i + 1}: </span>{s}
                </li>
              ))}
            </ol>
            {hub.caption && <p className="m-0 type-desktop-body-caption-default text-on-accent">{hub.caption}</p>}
          </div>
          <Lane n={targets.length} side="out" animated={animated} />
          <div className="flex flex-col gap-3 @3xl:flex-1">
            <p className="m-0 type-desktop-body-eyebrow text-tertiary @3xl:hidden" aria-hidden="true">[ {targetsLabel} ]</p>
            <ul aria-label={targetsLabel} className="m-0 flex list-none flex-col gap-4 p-0 @3xl:gap-10">
              {targets.map((t) => <NodeCard key={t.id} node={t} side="target" />)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
