"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Settings } from "lucide-react";
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
    const handleZoomChange = (e: CustomEvent<{ zoomed: boolean }>) => {
      setIsZoomed(e.detail.zoomed);
    };

    window.addEventListener("zoomchange" as any, handleZoomChange);

    return () => {
      window.removeEventListener("zoomchange" as any, handleZoomChange);
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
            <Link href="/library">jharo</Link>
          </div>

          <nav className="app-header__nav">
            <span className="app-header__user-email">{user?.email}</span>
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
