import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, style, ...props }, ref) => (
    <textarea
      ref={ref}
      style={{
        display: 'flex',
        width: '100%',
        minHeight: '5rem',
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${error ? 'var(--destructive)' : 'var(--border)'}`,
        backgroundColor: 'var(--card)',
        color: 'var(--foreground)',
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: 1.6,
        transition: 'border-color 0.15s, box-shadow 0.15s',
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
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
