"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { BookOpen, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useLogout } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme/theme-provider";

interface AppHeaderProps {
  hideOnZoom?: boolean;
  className?: string;
}

export function AppHeader({ hideOnZoom = false, className = "" }: AppHeaderProps) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const logoutMutation = useLogout();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

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
            <div className="app-header__profile" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="app-header__profile-button"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                title="Profile"
              >
                {user?.email ? (
                  <span className="app-header__avatar" aria-hidden="true">
                    {(user.first_name || user.email).charAt(0).toUpperCase()}
                  </span>
                ) : <UserRound size={20} aria-hidden="true" />}
              </button>
              {profileOpen && (
                <div className="app-header__profile-menu" role="menu" aria-label="Profile menu">
                  {user?.email && (
                    <div className="app-header__profile-details">
                      <span className="app-header__menu-avatar" aria-hidden="true">
                        {(user.first_name || user.email).charAt(0).toUpperCase()}
                      </span>
                      <span className="app-header__profile-copy">
                        <span className="app-header__profile-name">
                          {user.first_name || user.last_name
                            ? `${user.first_name} ${user.last_name}`.trim()
                            : user.username}
                        </span>
                        <span className="app-header__profile-email">{user.email}</span>
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="app-header__menu-item"
                    role="menuitemcheckbox"
                    aria-checked={isDark}
                    onClick={toggleTheme}
                  >
                    {isDark ? <Moon size={17} /> : <Sun size={17} />}
                    <span className="app-header__menu-label">Appearance</span>
                    <span className="app-header__menu-value">{isDark ? "Dark" : "Light"}</span>
                  </button>
                  {user && <div className="app-header__menu-divider" />}
                  {user && (
                    <button
                      type="button"
                      className="app-header__menu-item app-header__menu-item--logout"
                      role="menuitem"
                      disabled={logoutMutation.isPending}
                      onClick={() => {
                        setProfileOpen(false);
                        logoutMutation.mutate();
                      }}
                    >
                      <LogOut size={17} />
                      <span>{logoutMutation.isPending ? "Logging out…" : "Log out"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
