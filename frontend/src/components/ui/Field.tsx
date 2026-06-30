import React from 'react';

interface FieldProps {
  label:     string;
  htmlFor?:  string;
  error?:    string;
  required?: boolean;
  hint?:     string;
  children:  React.ReactNode;
}

export function Field({ label, htmlFor, error, required, hint, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--foreground)',
          display: 'flex',
          gap: '0.25rem',
          alignItems: 'center',
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--destructive)' }} aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{hint}</p>
      )}
      {error && (
        <p role="alert" style={{ fontSize: '0.75rem', color: 'var(--destructive)' }}>{error}</p>
      )}
    </div>
  );
}
