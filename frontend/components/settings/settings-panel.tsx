"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLogout } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme/theme-provider";
import {
  X,
  User,
  Settings as SettingsIcon,
  Bell,
  Moon,
  Sun,
  BookOpen,
  LogOut,
  Mail,
  ChevronRight,
  Palette,
} from "lucide-react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const { theme, toggleTheme, isDark } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="settings-backdrop" onClick={onClose} />

      {/* Panel */}
      <aside className="settings-panel">
        {/* Header */}
        <div className="settings-panel__header">
          <div>
            <h2 className="settings-panel__title">Settings</h2>
            <p className="settings-panel__subtitle">Manage your account and preferences</p>
          </div>
          <button
            onClick={onClose}
            className="settings-panel__close"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="settings-panel__content">
          {/* Profile Section */}
          <section className="settings-section">
            <div className="settings-section__header">
              <User size={18} />
              <h3>Profile</h3>
            </div>

            <div className="settings-profile">
              <div className="settings-profile__avatar">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="settings-profile__info">
                <p className="settings-profile__name">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username || "User"}
                </p>
                <p className="settings-profile__email">{user?.email}</p>
              </div>
            </div>

            <button className="settings-option">
              <div className="settings-option__content">
                <Mail size={16} />
                <span>Edit profile</span>
              </div>
              <ChevronRight size={16} className="settings-option__arrow" />
            </button>
          </section>

          {/* Appearance */}
          <section className="settings-section">
            <div className="settings-section__header">
              <Palette size={18} />
              <h3>Appearance</h3>
            </div>

            {/* Theme Toggle */}
            <div className="settings-toggle">
              <div className="settings-toggle__info">
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
                <div>
                  <p className="settings-toggle__label">
                    {isDark ? "Dark mode" : "Light mode"}
                  </p>
                  <p className="settings-toggle__description">
                    {isDark ? "Using dark theme" : "Using light theme"}
                  </p>
                </div>
              </div>
              <button
                className={`settings-toggle__switch ${
                  isDark ? "settings-toggle__switch--active" : ""
                }`}
                onClick={toggleTheme}
                role="switch"
                aria-checked={isDark}
              >
                <span className="settings-toggle__switch-handle" />
              </button>
            </div>
          </section>

          {/* App Settings */}
          <section className="settings-section">
            <div className="settings-section__header">
              <SettingsIcon size={18} />
              <h3>App Settings</h3>
            </div>

            {/* Notifications Toggle */}
            <div className="settings-toggle">
              <div className="settings-toggle__info">
                <Bell size={16} />
                <div>
                  <p className="settings-toggle__label">Notifications</p>
                  <p className="settings-toggle__description">
                    Enable reading reminders
                  </p>
                </div>
              </div>
              <button
                className={`settings-toggle__switch ${
                  notifications ? "settings-toggle__switch--active" : ""
                }`}
                onClick={() => setNotifications(!notifications)}
                role="switch"
                aria-checked={notifications}
              >
                <span className="settings-toggle__switch-handle" />
              </button>
            </div>
          </section>

          {/* Reading Preferences */}
          <section className="settings-section">
            <div className="settings-section__header">
              <BookOpen size={18} />
              <h3>Reading Preferences</h3>
            </div>

            <button className="settings-option">
              <div className="settings-option__content">
                <span>Font size</span>
              </div>
              <div className="settings-option__value">
                Medium
                <ChevronRight size={16} className="settings-option__arrow" />
              </div>
            </button>

            <button className="settings-option">
              <div className="settings-option__content">
                <span>Line spacing</span>
              </div>
              <div className="settings-option__value">
                Normal
                <ChevronRight size={16} className="settings-option__arrow" />
              </div>
            </button>

            <button className="settings-option">
              <div className="settings-option__content">
                <span>Reading goal</span>
              </div>
              <div className="settings-option__value">
                Not set
                <ChevronRight size={16} className="settings-option__arrow" />
              </div>
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="settings-panel__footer">
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="settings-logout-button"
          >
            <LogOut size={18} />
            <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
          </button>
          <p className="settings-panel__version">Jharo v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
