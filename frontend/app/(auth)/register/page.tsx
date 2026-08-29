"use client";

import RegisterForm from "@/components/auth/register-form";
import { GuestRoute } from "@/components/auth/guest-route";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <GuestRoute>
      <main className="login-page register-page">
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
              JOIN THE READING SPACE
            </span>

            <h1 className="font-reading">
              Make a little
              <br />
              <em>room.</em>
            </h1>

            <p>
              Create your account and keep the
              stories worth returning to close.
            </p>
          </div>

          <RegisterForm />
        </div>
      </main>
    </GuestRoute>
  );
}