import { useId, useMemo, useState, type ReactNode } from 'react';
import { Icon } from '../../icons/Icon';

/**
 * Table: rows of records with the same fields, to compare or scan (closes design.md G20).
 * A real `<table>` with a caption, column headers and a row header, so screen readers can say
 * "VW-204-E, Status, Paid" when moving between cells.
 *
 * - Text columns align start; numbers and amounts align end with tabular figures.
 * - One column names the row (`isRowHeader`): usually the first.
 * - Sortable columns are buttons in the header; the sorted one has `aria-sort`.
 * - The table scrolls sideways inside its own frame on narrow screens; the frame is focusable so
 *   keyboard users can scroll it. Under ~5 columns on a phone, prefer a list of Cards.
 * - Rows are not clickable. Put the action in a cell (a link or Button `size="sm"`).
 */
export interface TableColumn<T> {
  key: string;
  header: string;
  /** `end` for numbers, amounts and dates that should line up. */
  align?: 'start' | 'end';
  /** Cell content. Defaults to `row[key]`. */
  render?: (row: T) => ReactNode;
  /** Makes the header a sort button. Sorting uses `sortValue`, else `row[key]`. */
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  /** This column names the row (`<th scope="row">`). */
  isRowHeader?: boolean;
  /** Visually hide the header text (e.g. an actions column). It stays readable for screen readers. */
  hideHeader?: boolean;
}

export type SortDirection = 'ascending' | 'descending';

export interface TableProps<T> {
  /** Required. What the table lists. Also the name of the scroll frame. */
  caption: string;
  hideCaption?: boolean;
  columns: TableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** `compact` for dense admin views; `default` everywhere else. */
  density?: 'default' | 'compact';
  defaultSort?: { key: string; direction: SortDirection };
  /** Shown in a single cell when `rows` is empty. Say why it's empty and what to do. */
  emptyState?: ReactNode;
  className?: string;
}

const pad = { default: 'px-4 py-4', compact: 'px-3 py-2' } as const;

export function Table<T>({
  caption, hideCaption = false, columns, rows, getRowId, density = 'default', defaultSort, emptyState = 'Nothing here yet.', className,
}: TableProps<T>) {
  const captionId = useId();
  const [sort, setSort] = useState(defaultSort);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get = col.sortValue ?? ((r: T) => (r as Record<string, unknown>)[col.key] as string | number);
    const dir = sort.direction === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = get(a), y = get(b);
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
    });
  }, [rows, columns, sort]);

  const toggle = (key: string) =>
    setSort((s) => ({ key, direction: s?.key === key && s.direction === 'ascending' ? 'descending' : 'ascending' }));
  const sortedCol = sort && columns.find((c) => c.key === sort.key);

  return (
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      className={['overflow-x-auto rounded-container border border-subtle bg-surface outline-none focus-visible:shadow-focus', className].filter(Boolean).join(' ')}
    >
      <table className="w-full border-collapse text-left">
        <caption id={captionId} className={hideCaption ? 'sr-only' : 'px-4 pb-1 pt-4 text-left type-desktop-body-caption-strong text-primary'}>
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-subtle bg-subtle">
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const alignCls = c.align === 'end' ? 'text-right' : 'text-left';
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={c.sortable ? (active ? sort!.direction : 'none') : undefined}
                  className={`${pad[density]} ${alignCls} whitespace-nowrap type-desktop-table-title text-secondary`}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      className={`-mx-1 inline-flex items-center gap-1 rounded-small px-1 text-inherit outline-none hover:text-primary focus-visible:shadow-focus ${c.align === 'end' ? 'flex-row-reverse' : ''}`}
                      style={{ font: 'inherit', letterSpacing: 'inherit' }}
                    >
                      <span>{c.header}</span>
                      <Icon
                        name={active ? (sort!.direction === 'ascending' ? 'chevron-up' : 'chevron-down') : 'chevron-up-down'}
                        size={16}
                        className={active ? 'text-primary' : 'text-tertiary'}
                      />
                    </button>
                  ) : c.hideHeader ? (
                    <span className="sr-only">{c.header}</span>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center type-desktop-body-caption-default text-tertiary">{emptyState}</td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr key={getRowId(row)} className="border-b border-subtle last:border-b-0">
                {columns.map((c) => {
                  const content = c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '');
                  const cls = `${pad[density]} align-middle ${c.align === 'end' ? 'text-right tabular-nums' : 'text-left'} ${
                    c.isRowHeader ? 'type-desktop-table-cell-strong text-primary' : 'type-desktop-table-cell-default text-primary'
                  }`;
                  return c.isRowHeader ? (
                    <th key={c.key} scope="row" className={cls}>{content}</th>
                  ) : (
                    <td key={c.key} className={cls}>{content}</td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="sr-only" aria-live="polite">
        {sortedCol ? `Sorted by ${sortedCol.header}, ${sort!.direction}` : ''}
      </p>
    </div>
  );
}
