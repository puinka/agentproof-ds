/** Figma: `Logo` (`Tone=Default|Inverse`). Placeholder brand «Voltwise» for the portfolio. */
export function Logo({ tone = 'default' }: { tone?: 'default' | 'inverse' }) {
  const inv = tone === 'inverse';
  return (
    <span className="inline-flex items-center gap-2.5" aria-hidden="true">
      <span className={`inline-flex size-9 items-center justify-center rounded-inner ${inv ? 'bg-highlight text-on-highlight' : 'bg-action text-inverse'}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" /></svg>
      </span>
      <span className={`font-heading text-[28px] leading-none font-semibold tracking-[-0.03em] ${inv ? 'text-inverse' : 'text-primary'}`}>Voltwise</span>
    </span>
  );
}
