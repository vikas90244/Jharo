'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues } from '@/lib/validations/auth';
import styles from '../auth.module.scss';
import Link from 'next/link';

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const resData = await response.json();
      if (response.ok) {
        setSuccessMsg("Welcome to Jharo. Please check your email to verify your account.");
      } else {
        setServerError(resData.error || "Registration failed.");
      }
    } catch (error) {
      setServerError(`Network error. Please try again. ${error}`);
    }
  };

  if (successMsg) {
    return <div className={styles.container}><div className={styles.success}>{successMsg}</div></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Join Jharo</h1>
        <p className={styles.subtitle}>Upload, read, and understand.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <input type="email" placeholder="Email" {...register('email')} />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>

          <div className={styles.inputGroup}>
            <input type="password" placeholder="Password" {...register('password')} />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>

          <div className={styles.inputGroup}>
            <input type="password" placeholder="Confirm Password" {...register('confirmPassword')} />
            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}
          </div>

          {serverError && <div className={styles.serverError}>{serverError}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className={styles.footerText}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}