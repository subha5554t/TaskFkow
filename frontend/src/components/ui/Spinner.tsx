import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={className}
      aria-label="Loading"
      style={{ animation: 'spin 0.75s linear infinite' }}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      color: 'var(--muted-foreground)',
    }}>
      <Spinner size={32} />
    </div>
  );
}
