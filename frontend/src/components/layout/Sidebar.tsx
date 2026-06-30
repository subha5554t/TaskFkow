import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Settings, CheckCircle2 } from 'lucide-react';


const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects',  label: 'Projects',  icon: FolderKanban },
  { to: '/settings',  label: 'Settings',  icon: Settings },
] as const;

export function Sidebar() {

  return (
    <aside style={{
      display: 'none', // shown via media query below — we use a style tag
      width: '220px', flexShrink: 0, flexDirection: 'column',
      borderRight: '1px solid var(--border)', background: 'var(--card)',
      height: '100vh', position: 'sticky', top: 0, overflowY: 'auto',
    }}
    className="sidebar-nav"
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        height: '3.5rem', padding: '0 1rem',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', flexShrink: 0,
        }}>
          <CheckCircle2 size={15} />
        </div>
        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
          TaskFlow
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', padding: '0.75rem 0.625rem', flex: 1 }}>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 0.625rem', borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
              color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
              backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
              transition: 'background-color 0.15s, color 0.15s',
            })}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              if (el.getAttribute('aria-current') !== 'page') {
                el.style.backgroundColor = 'var(--secondary)';
                el.style.color = 'var(--foreground)';
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              if (el.getAttribute('aria-current') !== 'page') {
                el.style.backgroundColor = 'transparent';
                el.style.color = 'var(--muted-foreground)';
              }
            }}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
