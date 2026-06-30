

interface SkeletonProps {
  className?: string;
  style?:     React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--muted)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ...style,
      }}
    />
  );
}

// Skeleton variants for common use cases
export function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      backgroundColor: 'var(--card)',
      padding: '1.25rem',
    }}>
      <Skeleton style={{ height: '0.875rem', width: '40%', marginBottom: '0.5rem' }} />
      <Skeleton style={{ height: '1.75rem', width: '60%', marginBottom: '0.25rem' }} />
      <Skeleton style={{ height: '0.75rem', width: '80%' }} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0' }}>
      <Skeleton style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} />
      <div style={{ flex: 1 }}>
        <Skeleton style={{ height: '0.875rem', width: '50%', marginBottom: '0.375rem' }} />
        <Skeleton style={{ height: '0.75rem',  width: '30%' }} />
      </div>
    </div>
  );
}
