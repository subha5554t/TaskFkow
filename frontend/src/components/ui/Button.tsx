import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   'primary' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?:      'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const BASE: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
  borderRadius: 'var(--radius-sm)', fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap',
  cursor: 'pointer', transition: 'background-color 0.15s, border-color 0.15s, opacity 0.15s',
  border: '1px solid transparent', outline: 'none', fontFamily: 'inherit',
};

const VARIANT: Record<string, React.CSSProperties> = {
  primary:     { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' },
  outline:     { backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--foreground)' },
  ghost:       { backgroundColor: 'transparent', color: 'var(--foreground)' },
  secondary:   { backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' },
  destructive: { backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' },
};

const SIZE: Record<string, React.CSSProperties> = {
  sm:   { height: '2rem',    padding: '0 0.75rem', fontSize: '0.8125rem' },
  md:   { height: '2.25rem', padding: '0 1rem',    fontSize: '0.875rem' },
  lg:   { height: '2.75rem', padding: '0 1.5rem',  fontSize: '1rem' },
  icon: { height: '2.25rem', width: '2.25rem',     padding: '0',         fontSize: '0.875rem' },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ style, variant = 'primary', size = 'md', isLoading, disabled, children, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const hoverBg: Record<string, string> = {
      primary: 'var(--primary-hover)', outline: 'var(--secondary)',
      ghost: 'var(--secondary)', secondary: 'var(--border)', destructive: 'var(--destructive-hover)',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{ ...BASE, ...VARIANT[variant], ...SIZE[size], opacity: (disabled || isLoading) ? 0.5 : 1, pointerEvents: (disabled || isLoading) ? 'none' : undefined, ...style }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverBg[variant]; onMouseEnter?.(e); }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = (VARIANT[variant].backgroundColor as string) ?? ''; onMouseLeave?.(e); }}
        {...props}
      >
        {isLoading && <Loader2 size={14} style={{ animation: 'spin 0.75s linear infinite' }} aria-hidden />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
