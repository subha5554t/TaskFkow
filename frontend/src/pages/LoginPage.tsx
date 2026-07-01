import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { ApiError } from '@/lib/apiError';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: '', password: '' },
    });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async values => {
    try {
      await login(values);
      navigate('/dashboard');
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'Unable to sign in',
      });
    }
  });

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your TaskFlow workspace"
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" error={!!errors.email} {...register('email')} />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input id="password" type="password" autoComplete="current-password" error={!!errors.password} {...register('password')} />
        </Field>

        {errors.root && (
          <p role="alert" style={{
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgb(220 38 38 / 0.08)',
            padding: '0.625rem 0.75rem',
            fontSize: '0.875rem',
            color: 'var(--destructive)',
          }}>
            {errors.root.message}
          </p>
        )}

        <Button type="submit" style={{ width: '100%' }} isLoading={isSubmitting}>
          Sign in
        </Button>

      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title:    string;
  subtitle: string;
  children: React.ReactNode;
  footer:   React.ReactNode;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      padding: '2.5rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '22rem' }}>
        {/* Logo mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '2.5rem', height: '2.5rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '0.75rem',
          }}>
            <CheckCircle2 size={20} />
          </div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            {subtitle}
          </p>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow)',
        }}>
          {children}
        </div>

        {/* Footer link */}
        <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
          {footer}
        </p>
      </div>
    </div>
  );
}
