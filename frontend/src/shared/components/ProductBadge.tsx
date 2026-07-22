import { cn } from '../utils/cn';

export interface ProductBadgeProps {
  type: 'new' | 'discount';
  label: string;
  className?: string;
}

export const ProductBadge = ({ type, label, className }: ProductBadgeProps) => {
  return (
    <span
      className={cn(
        'px-2 py-1 rounded text-label-sm text-white inline-block',
        type === 'new' && 'bg-primary',
        type === 'discount' && 'bg-tertiary',
        className
      )}
    >
      {label}
    </span>
  );
};
