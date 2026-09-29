'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useAuth } from '@/components/auth/auth-provider';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/library');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">jharo</div>

        <nav className="landing-nav">
          <Link href="/login" className="nav-link">
            Log in
          </Link>
          <Link href="/register" className="nav-link nav-link-primary">
            Sign up
          </Link>
        </nav>
      </header>

      <div className="landing-content">
        <div className="landing-hero">
          <span className="eyebrow">YOUR READING WORKSPACE</span>

          <h1 className="font-reading">
            A little room
            <br />
            for your <em>books.</em>
          </h1>

          <p className="landing-description">
            Jharo is a reading workspace that helps you understand books without
            leaving them. Keep your notes, highlights, and thoughts all in one
            place.
          </p>

          <div className="landing-actions">
            <Link href="/register" className="action-button action-button-primary">
              Get started
            </Link>
            <Link href="/login" className="action-button action-button-secondary">
              Log in
            </Link>
          </div>
        </div>
      </div>

      <footer className="landing-footer">
        <p>Made for readers who think deeply.</p>
      </footer>
    </main>
  );
}
