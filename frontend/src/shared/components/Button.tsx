import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'h-12 px-6 rounded text-label-sm flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          fullWidth && 'w-full',
          variant === 'primary' && 'bg-primary text-on-primary hover:bg-primary-container',
          variant === 'accent' && 'bg-tertiary text-on-tertiary hover:bg-tertiary-container',
          variant === 'ghost' && 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-on-primary',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
