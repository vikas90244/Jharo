"use client";

import { ReactNode } from "react";
import { AppHeader } from "./app-header";

interface AppLayoutProps {
  children: ReactNode;
  hideHeaderOnZoom?: boolean;
  showHeader?: boolean;
  headerClassName?: string;
}

export function AppLayout({
  children,
  hideHeaderOnZoom = false,
  showHeader = true,
  headerClassName = "",
}: AppLayoutProps) {
  return (
    <div className="app-layout">
      {showHeader && (
        <AppHeader hideOnZoom={hideHeaderOnZoom} className={headerClassName} />
      )}
      <main className="app-layout__main">{children}</main>
    </div>
  );
}
