import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api';
import { profileSchema, type ProfileInput } from '@/lib/validators';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Moon, Sun } from 'lucide-react';

export function SettingsPage() {
  const { user, setUser } = useAuth();
  const [saved, setSaved]   = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ProfileInput>({
      resolver: zodResolver(profileSchema),
      defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
    });

  const onSubmit = handleSubmit(async data => {
    const updated = await authApi.updateProfile(data);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('taskflow:theme', next ? 'dark' : 'light');
  };

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>Settings</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
          Manage your account preferences.
        </p>
      </div>

      {/* Profile section */}
      <section style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Profile</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
            Update your name and email address.
          </p>
        </div>
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <Avatar name={user.name} size="lg" />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{user.name}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{user.email}</p>
              </div>
            </div>
          )}
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Full name" htmlFor="s-name" error={errors.name?.message} required>
              <Input id="s-name" {...register('name')} error={!!errors.name} />
            </Field>
            <Field label="Email" htmlFor="s-email" error={errors.email?.message} required>
              <Input id="s-email" type="email" {...register('email')} error={!!errors.email} />
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button type="submit" size="sm" isLoading={isSubmitting}>Save changes</Button>
              {saved && <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 500 }}>✓ Saved!</span>}
            </div>
          </form>
        </div>
      </section>

      {/* Appearance section */}
      <section style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Appearance</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
            Choose between light and dark mode.
          </p>
        </div>
        <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {isDark ? <Moon size={18} style={{ color: 'var(--primary)' }} /> : <Sun size={18} style={{ color: 'var(--warning)' }} />}
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{isDark ? 'Dark mode' : 'Light mode'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleDark}
            style={{
              position: 'relative',
              width: '2.5rem', height: '1.375rem',
              borderRadius: '9999px',
              backgroundColor: isDark ? 'var(--primary)' : 'var(--border)',
              border: 'none', cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle dark mode"
          >
            <span style={{
              position: 'absolute',
              top: '0.1875rem', left: isDark ? '1.25rem' : '0.1875rem',
              width: '1rem', height: '1rem',
              borderRadius: '50%',
              backgroundColor: '#fff',
              transition: 'left 0.2s',
              boxShadow: 'var(--shadow-sm)',
            }} />
          </button>
        </div>
      </section>
    </div>
  );
}
