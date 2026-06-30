import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, style, children, ...props }, ref) => (
    <select
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
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...style,
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'var(--ring)';
        e.currentTarget.style.boxShadow   = '0 0 0 2px rgb(109 40 217 / 0.12)';
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = error ? 'var(--destructive)' : 'var(--border)';
        e.currentTarget.style.boxShadow   = 'none';
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
