"use client";

import RegisterForm from "@/components/auth/register-form";
import { GuestRoute } from "@/components/auth/guest-route";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <GuestRoute>
      <main className="login-page register-page">
        <header className="login-header">
          <Link href="/" className="login-logo"><span className="login-brand-symbol" aria-hidden="true">j</span>Jharo</Link>

          <Link href="/" className="back-link">
            ← back home
          </Link>
        </header>

        <div className="login-content">
          <div className="login-intro">
            <span className="eyebrow">
              CREATE AN ACCOUNT
            </span>

            <h1 className="font-reading">
              Create your
              <br />
              <em>library.</em>
            </h1>

            <p>
              Create an account to upload PDF books and read them in Jharo.
            </p>
          </div>

          <RegisterForm />
        </div>
      </main>
    </GuestRoute>
  );
}
