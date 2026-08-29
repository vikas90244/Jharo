# Settings Panel Visual Guide

## Overview

The settings panel is a slide-in drawer that provides access to user profile, app settings, reading preferences, and logout functionality.

## Visual Structure

```
┌──────────────────────────────────────────┐
│  Settings                          ✕     │ ← Header
│  Manage your account and preferences     │
├──────────────────────────────────────────┤
│                                          │
│  PROFILE                          👤     │ ← Section
│  ┌────────────────────────────────────┐  │
│  │  [U]  User Name                   │  │
│  │       user@email.com              │  │
│  └────────────────────────────────────┘  │
│  [✉] Edit profile                    ›  │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  APP SETTINGS                      ⚙     │ ← Section
│  [☀] Dark mode                    [○──] │ ← Toggle (off)
│      Switch to dark theme               │
│                                          │
│  [🔔] Notifications               [──●] │ ← Toggle (on)
│       Enable reading reminders          │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  READING PREFERENCES               📖    │ ← Section
│  Font size                    Medium  ›  │
│  Line spacing                 Normal  ›  │
│  Reading goal                Not set  ›  │
│                                          │
├══════════════════════════════════════════┤
│                                          │
│  ┌────────────────────────────────────┐  │ ← Footer
│  │  ← Log out                        │  │
│  └────────────────────────────────────┘  │
│  Jharo v1.0.0                            │
│                                          │
└──────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header Section
```
┌──────────────────────────────────────────┐
│  Settings                          ✕     │
│  Manage your account and preferences     │
└──────────────────────────────────────────┘
```

- **Title:** Large, bold "Settings"
- **Subtitle:** Small, muted description
- **Close Button:** X icon, top right
- **Background:** Slight white tint, subtle border

### 2. Profile Section
```
PROFILE                          👤

┌────────────────────────────────────┐
│  [U]  User Name                    │
│       user@email.com               │
└────────────────────────────────────┘
[✉] Edit profile                    ›
```

**Profile Card:**
- Round avatar with initial
- User name (or username)
- Email address
- Light background with border
- Padding and rounded corners

**Edit Option:**
- Icon + text
- Chevron right indicator
- Hover: Light background
- Ready to link to profile page

### 3. App Settings Section
```
APP SETTINGS                      ⚙

[☀] Dark mode                    [○──]
    Switch to dark theme

[🔔] Notifications               [──●]
     Enable reading reminders
```

**Toggle Items:**
- Icon on left
- Label and description
- Toggle switch on right
- Switch slides when clicked
- Color changes: gray → wood brown

**Toggle Switch States:**
```
OFF:  [○──]  Gray background
ON:   [──●]  Wood brown background
```

### 4. Reading Preferences Section
```
READING PREFERENCES               📖

Font size                    Medium  ›
Line spacing                 Normal  ›
Reading goal                Not set  ›
```

**Option Items:**
- Label on left
- Current value + chevron on right
- Hover: Light background
- Click: Opens selection modal (to be implemented)

### 5. Footer Section
```
┌────────────────────────────────────┐
│  ← Log out                         │
└────────────────────────────────────┘
Jharo v1.0.0
```

**Logout Button:**
- Full width
- Dark background (ink color)
- White text
- Icon + text centered
- Hover: Darker + lift effect
- Loading state: "Logging out..."

**Version Number:**
- Small, centered text
- Muted color
- Below logout button

## States & Interactions

### Opening Animation
```
1. Backdrop fades in (200ms)
2. Panel slides from right (250ms)
3. Both animations use ease timing
```

### Closing Animation
```
1. Panel slides out to right (250ms)
2. Backdrop fades out (200ms)
3. Component unmounts
```

### Toggle Animation
```
OFF → ON:
1. Background: gray → wood brown (200ms)
2. Handle: slides left → right (200ms)
3. Smooth ease transition
```

### Button Hover
```
1. Background: transparent → light tint (180ms)
2. Border: same color (no change)
3. Cursor: pointer
```

### Button Active
```
1. Scale: 100% → 98% (instant)
2. Returns to 100% on release
```

## Color Palette

### Background Colors
```scss
Main background:     var(--paper)          #f8f4ea
Card background:     rgba(255,255,255,0.5) white tint
Header background:   rgba(255,255,255,0.4) white tint
Hover background:    rgba(255,255,255,0.6) white tint
```

### Text Colors
```scss
Primary text:        var(--ink)            #33302a
Secondary text:      var(--text-secondary) #736c5e
Muted text:          var(--text-secondary) #736c5e
```

### Border & Accent Colors
```scss
Border:              var(--border)         #ddd3c2
Toggle active:       var(--accent-wood)    #8c6b4f
Section icon:        var(--accent-wood)    #8c6b4f
```

### Button Colors
```scss
Logout button:       var(--ink)            #33302a (background)
Logout button text:  var(--paper)          #f8f4ea (text)
Logout hover:        #49443b                darker
```

## Spacing System

### Padding
```scss
Panel padding:       32px (desktop), 24px (mobile)
Section padding:     32px bottom
Card padding:        16px
Button padding:      14px vertical, 16px horizontal
Toggle padding:      14px vertical, 16px horizontal
```

### Gaps
```scss
Profile gap:         16px (avatar to text)
Nav gap:             24px (between options)
Icon gap:            12px (icon to text)
Toggle gap:          flexible (space-between)
```

### Margins
```scss
Section header mb:   20px
Profile card mb:     12px
Option mb:           6px
```

## Typography

### Font Sizes
```scss
Panel title:         1.5rem   (24px)
Panel subtitle:      0.8rem   (12.8px)
Section header:      0.8rem   (12.8px)
Profile name:        1rem     (16px)
Profile email:       0.8rem   (12.8px)
Toggle label:        0.9rem   (14.4px)
Toggle description:  0.75rem  (12px)
Option text:         0.9rem   (14.4px)
Option value:        0.85rem  (13.6px)
Version:             0.7rem   (11.2px)
```

### Font Weights
```scss
Panel title:         600 (semibold)
Section header:      600 (semibold)
Profile name:        600 (semibold)
Profile email:       400 (regular)
Toggle label:        500 (medium)
Option text:         500 (medium)
Button text:         600 (semibold)
```

### Text Transform
```scss
Section header:      uppercase
Everything else:     none
```

### Letter Spacing
```scss
Panel title:         -0.02em (tight)
Section header:       0.08em (tracked)
Everything else:      normal
```

## Icons

Using **Lucide Icons** (18px or 16px):

```tsx
Section Icons (18px):
- User (profile)
- Settings (app settings)
- BookOpen (reading preferences)

Option Icons (16px):
- Mail (edit profile)
- Moon/Sun (dark mode)
- Bell (notifications)
- LogOut (logout)
- ChevronRight (navigation indicator)
```

## Responsive Breakpoints

### Desktop (>800px)
- Panel width: 420px
- Full padding: 32px
- All text visible

### Tablet (500-800px)
- Panel width: 420px
- Full padding: 32px
- All text visible

### Mobile (<500px)
- Panel width: 100%
- Reduced padding: 24px
- Smaller title: 1.3rem
- All features work

### Small Mobile (<380px)
- Panel width: 100%
- Padding: 24px
- Name: 0.95rem
- Email: 0.75rem
- Compact but readable

## Accessibility

### Keyboard Navigation
```
Tab:        Focus next element
Shift+Tab:  Focus previous element
Enter:      Activate button/toggle
Space:      Activate button/toggle
Escape:     Close panel (to be implemented)
```

### ARIA Attributes
```tsx
Close button:        aria-label="Close settings"
Settings button:     aria-label="Open settings"
Toggle switches:     role="switch" aria-checked="true/false"
```

### Screen Reader
```
Reads:
- Section headings
- Button labels
- Toggle states
- Current values
```

### Focus Indicators
- Visible outline on focused elements
- High contrast
- Doesn't interfere with design

## Usage Example

```tsx
import { useState } from "react";
import { SettingsPanel } from "@/components/settings/settings-panel";

function MyComponent() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button onClick={() => setShowSettings(true)}>
        Open Settings
      </button>

      {/* Settings panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
```

## Implementation Status

### ✅ Complete
- Panel structure
- Profile section
- All UI elements
- Animations
- Responsive design
- Logout functionality
- Dark mode toggle (UI + state)
- Notifications toggle (UI + state)

### 🔄 Ready for Implementation
- Edit profile page
- Font size selection modal
- Line spacing selection modal
- Reading goal setting
- Persist settings to backend/localStorage
- Dark mode theme application
- Notifications system

### 📋 Future Enhancements
- Settings search
- Keyboard shortcuts
- More customization options
- Privacy settings
- Data export
- Account deletion

## Tips for Extension

### Adding a New Toggle
1. Add state: `const [mySetting, setMySetting] = useState(false)`
2. Copy existing toggle JSX
3. Update icon, label, description
4. Connect to state
5. Implement actual functionality

### Adding a New Section
1. Copy section structure
2. Update section header icon and title
3. Add your options inside
4. Style follows automatically

### Persisting Settings
```tsx
// Save to localStorage
useEffect(() => {
  localStorage.setItem("darkMode", JSON.stringify(darkMode));
}, [darkMode]);

// Load from localStorage
const [darkMode, setDarkMode] = useState(
  () => JSON.parse(localStorage.getItem("darkMode") || "false")
);
```

---

Your settings panel is beautiful, functional, and ready to use! 🎨✨
