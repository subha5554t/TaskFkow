import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import { ApiError } from '@/lib/apiError';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthShell } from './LoginPage';

export function RegisterPage() {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async values => {
    try {
      await registerUser(values);
      navigate('/dashboard');
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'Unable to create account',
      });
    }
  });

  return (
    <AuthShell
      title="Create an account"
      subtitle="Start managing your projects with TaskFlow"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
        <Field label="Full name" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" type="text" autoComplete="name" error={!!errors.name} {...register('name')} />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" error={!!errors.email} {...register('email')} />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message} required hint="At least 8 characters">
          <Input id="password" type="password" autoComplete="new-password" error={!!errors.password} {...register('password')} />
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
          <Input id="confirmPassword" type="password" autoComplete="new-password" error={!!errors.confirmPassword} {...register('confirmPassword')} />
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
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
