import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full min-w-0">
        {label && <label className="text-body-md font-semibold text-on-surface">{label}</label>}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full h-12 px-4 rounded border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed transition-shadow',
            'disabled:opacity-50 disabled:bg-surface-container-low disabled:cursor-not-allowed',
            error && 'border-error focus:border-error focus:ring-error-container',
            className
          )}
          {...props}
        />
        {error && <span className="text-body-sm text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
