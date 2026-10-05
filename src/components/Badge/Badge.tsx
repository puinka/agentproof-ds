import { Icon, type IconName } from '../../icons/Icon';

/**
 * Figma: `Badge` (`Status=Neutral|Info|Success|Warning|Error`, `Label`, `Icon`). Not interactive.
 * Always a word, plus an icon for the four status families: colour alone never carries the status.
 * Don't repeat the same badge in every row; if every row is "Active", none stands out.
 * For filters use FilterChip.
 */
export interface BadgeProps {
  label: string;
  status?: 'neutral' | 'info' | 'success' | 'warning' | 'error';
  /** Hide the icon in very dense layouts. The label must still name the status. */
  showIcon?: boolean;
  className?: string;
}

const ui: Record<NonNullable<BadgeProps['status']>, { cls: string; icon?: IconName }> = {
  neutral: { cls: 'bg-muted text-secondary' },
  info: { cls: 'bg-info text-info', icon: 'information-circle' },
  success: { cls: 'bg-success text-success', icon: 'check-circle' },
  warning: { cls: 'bg-warning text-warning', icon: 'exclamation-triangle' },
  error: { cls: 'bg-error text-error', icon: 'exclamation-circle' },
};

export function Badge({ label, status = 'neutral', showIcon = true, className }: BadgeProps) {
  const u = ui[status];
  return (
    <span className={['inline-flex w-fit items-center gap-1 rounded-pill px-2.5 py-1 type-desktop-body-caption-strong', u.cls, className].filter(Boolean).join(' ')}>
      {showIcon && u.icon && <Icon name={u.icon} size={16} />}
      {label}
    </span>
  );
}
