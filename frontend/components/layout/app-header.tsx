"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { BookOpen, Settings } from "lucide-react";
import { SettingsPanel } from "@/components/settings/settings-panel";

interface AppHeaderProps {
  hideOnZoom?: boolean;
  className?: string;
}

export function AppHeader({ hideOnZoom = false, className = "" }: AppHeaderProps) {
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!hideOnZoom) return;

    // Listen for custom zoom events (you can trigger these from book reader components)
    const handleZoomChange = (event: Event) => {
      const zoomEvent = event as CustomEvent<{ zoomed: boolean }>;
      setIsZoomed(zoomEvent.detail.zoomed);
    };

    window.addEventListener("zoomchange", handleZoomChange);

    return () => {
      window.removeEventListener("zoomchange", handleZoomChange);
    };
  }, [hideOnZoom]);

  return (
    <>
      <header
        className={`app-header ${hideOnZoom ? "app-header--hide-on-zoom" : ""} ${className}`}
        data-zoomed={isZoomed}
      >
        <div className="app-header__content">
          <div className="app-header__logo">
            <Link href="/library" aria-label="Jharo library home">
              <BookOpen size={19} strokeWidth={2.1} />
              <span>jharo</span>
            </Link>
          </div>

          <nav className="app-header__nav">
            {user?.email && (
              <div className="app-header__account" title={user.email}>
                <span className="app-header__avatar" aria-hidden="true">
                  {user.email.charAt(0).toUpperCase()}
                </span>
                <span className="app-header__user-email">{user.email}</span>
              </div>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="app-header__settings-button"
              aria-label="Open settings"
            >
              <Settings size={18} />
              <span className="app-header__settings-text">Settings</span>
            </button>
          </nav>
        </div>
      </header>

      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
