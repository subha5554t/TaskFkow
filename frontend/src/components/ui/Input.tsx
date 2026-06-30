import React from 'react';


export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        style={{
          display: 'flex',
          width: '100%',
          height: '2.25rem',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${error ? 'var(--destructive)' : 'var(--border)'}`,
          backgroundColor: 'var(--card)',
          color: 'var(--foreground)',
          padding: '0 0.75rem',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit',
          ...style,
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = error ? 'var(--destructive)' : 'var(--ring)';
          e.currentTarget.style.boxShadow   = `0 0 0 2px ${error ? 'rgb(220 38 38 / 0.15)' : 'rgb(109 40 217 / 0.12)'}`;
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = error ? 'var(--destructive)' : 'var(--border)';
          e.currentTarget.style.boxShadow   = 'none';
        }}
        className={className}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
