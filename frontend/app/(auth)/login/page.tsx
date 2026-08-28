'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '@/lib/validations/auth';
import styles from '../auth.module.scss';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // CRITICAL: Tells browser to accept the httpOnly cookies
      });

      const resData = await response.json();
      if (response.ok) {
        // Cookies are now set! Redirect to the main Jharo app
        router.push('/dashboard'); 
      } else {
        setServerError(resData.error || "Invalid credentials.");
      }
    } catch (error) {
      console.log(error)
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Welcome back</h1>
        <p className={styles.subtitle}>Continue reading on Jharo.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <input type="email" placeholder="Email" {...register('email')} />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>

          <div className={styles.inputGroup}>
            <input type="password" placeholder="Password" {...register('password')} />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>

          {serverError && <div className={styles.serverError}>{serverError}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className={styles.footerText}>
          Need an account? <Link href="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}