"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

type Placement = "header" | "footer" | "callout";

export function MarketingAccountLinks({ placement }: { placement: Placement }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (placement === "header") {
    return isAuthenticated ? (
      <Link href="/library" className="marketing-button marketing-button-small">
        My library <span aria-hidden="true">→</span>
      </Link>
    ) : (
      <>
        <Link href="/login" className="marketing-nav-link">Log in</Link>
        <Link href="/register" className="marketing-button marketing-button-small">
          Create your library <span aria-hidden="true">↗</span>
        </Link>
      </>
    );
  }

  if (placement === "footer") {
    return isAuthenticated ? (
      <Link href="/library">My library</Link>
    ) : (
      <>
        <Link href="/login">Log in</Link>
        <Link href="/register">Sign up</Link>
      </>
    );
  }

  return isAuthenticated ? (
    <Link href="/library" className="marketing-button">
      Go to my library <span aria-hidden="true">→</span>
    </Link>
  ) : (
    <Link href="/register" className="marketing-button">
      Create an account <span aria-hidden="true">→</span>
    </Link>
  );
}
