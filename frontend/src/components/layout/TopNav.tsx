import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

export function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  );
  
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('taskflow:theme', next ? 'dark' : 'light');
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  if (!user) return null;

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem',
      height: '3.5rem', padding: '0 1.5rem',
      borderBottom: '1px solid var(--border)', background: 'var(--card)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      {/* Theme toggle */}
      <button
        onClick={toggleDark}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '2rem', height: '2rem', borderRadius: '50%',
          border: '1px solid transparent', background: 'transparent',
          color: 'var(--muted-foreground)', cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'var(--secondary)';
          e.currentTarget.style.color = 'var(--foreground)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--muted-foreground)';
        }}
        aria-label="Toggle theme"
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {/* User Dropdown */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.25rem 0.5rem', borderRadius: 'var(--radius)',
            border: '1px solid transparent', background: 'transparent',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
          onMouseLeave={e => {
            if (!menuOpen) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Avatar name={user.name} size="sm" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
            {user.name}
          </span>
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
            width: '14rem', backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 50,
          }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                {user.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </p>
            </div>
            <div style={{ padding: '0.25rem' }}>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: 'var(--foreground)',
                  textDecoration: 'none', borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={15} />
                Profile & settings
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  width: '100%', textAlign: 'left',
                  padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: 'var(--destructive)',
                  background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
