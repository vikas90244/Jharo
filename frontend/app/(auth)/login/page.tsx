"use client";

import LoginForm from "@/components/auth/login-form";
import { GuestRoute } from "@/components/auth/guest-route";
import Link from "next/link";

export default function LoginPage() {
  return (
    <GuestRoute>
      <main className="login-page">
        <header className="login-header">
          <div className="login-logo">
            jharo
          </div>

          <Link href="/" className="back-link">
            ← back home
          </Link>
        </header>

        <div className="login-content">
          <div className="login-intro">
            <span className="eyebrow">
              YOUR READING SPACE
            </span>

            <h1 className="font-reading">
              Welcome
              <br />
              <em>back.</em>
            </h1>

            <p>
              Pick up where you left off.
              Your stories are waiting.
            </p>
          </div>

          <LoginForm />
        </div>

      
      </main>
    </GuestRoute>
  );
}