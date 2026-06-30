import { initials } from '@/lib/format';

interface AvatarProps {
  name:  string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 24, md: 32, lg: 40 };
const FONT_SIZES = { sm: 10, md: 13, lg: 16 };

// Simple deterministic colour from name
function avatarColor(name: string): string {
  const COLORS = [
    '#6d28d9', '#2563eb', '#0891b2', '#059669',
    '#d97706', '#dc2626', '#db2777', '#7c3aed',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const px  = SIZES[size];
  const fs  = FONT_SIZES[size];
  const bg  = avatarColor(name);

  return (
    <div
      aria-label={name}
      title={name}
      style={{
        width: px, height: px,
        borderRadius: '50%',
        backgroundColor: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fs,
        fontWeight: 600,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initials(name)}
    </div>
  );
}
