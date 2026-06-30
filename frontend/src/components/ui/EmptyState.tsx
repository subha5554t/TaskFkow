import { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?:        LucideIcon;
  title:        string;
  description?: string;
  action?:      ReactNode;
  className?:   string;
  style?:       React.CSSProperties;
}

export function EmptyState({ icon: Icon, title, description, action, style }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '3rem 1.5rem',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border)',
      gap: '0.75rem',
      ...style,
    }}>
      {Icon && (
        <div style={{
          width: '2.75rem', height: '2.75rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--muted-foreground)',
        }}>
          <Icon size={20} />
        </div>
      )}
      <div>
        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>{title}</p>
        {description && (
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
