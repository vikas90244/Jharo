# Layout Components Documentation

## Overview

The app now has a reusable layout system with a smart header and settings panel. These components provide a consistent UI across all protected pages.

## Components

### 1. AppLayout

A wrapper component that provides the consistent page structure with optional header.

**Location:** `components/layout/app-layout.tsx`

**Props:**
- `children` (ReactNode) - Page content
- `hideHeaderOnZoom` (boolean) - Whether to hide header when book is zoomed
- `showHeader` (boolean) - Whether to show header (default: true)
- `headerClassName` (string) - Additional CSS classes for header

**Usage:**
```tsx
import { AppLayout } from "@/components/layout/app-layout";

export default function MyPage() {
  return (
    <AppLayout hideHeaderOnZoom={true}>
      <div>Your content here</div>
    </AppLayout>
  );
}
```

---

### 2. AppHeader

Reusable header component with logo, user info, and settings button.

**Location:** `components/layout/app-header.tsx`

**Features:**
- Sticky positioning (stays at top when scrolling)
- Backdrop blur for elegant transparency
- Responsive design (collapses on mobile)
- Hide on zoom functionality for reading mode
- Opens settings panel

**Props:**
- `hideOnZoom` (boolean) - Hide header when zoom is active
- `className` (string) - Additional CSS classes

**Zoom Control:**

To hide the header when zooming into a book, dispatch a custom event:

```typescript
// When entering zoom/reading mode
window.dispatchEvent(
  new CustomEvent("zoomchange", {
    detail: { zoomed: true }
  })
);

// When exiting zoom/reading mode
window.dispatchEvent(
  new CustomEvent("zoomchange", {
    detail: { zoomed: false }
  })
);
```

**Responsive Behavior:**
- Desktop: Shows logo, email, "Settings" button with icon
- Tablet: Shows logo, "Settings" button with icon
- Mobile: Shows logo, icon-only settings button (circular)

---

### 3. SettingsPanel

A comprehensive slide-in panel for user settings and preferences.

**Location:** `components/settings/settings-panel.tsx`

**Features:**
- Slide-in from right with smooth animation
- Backdrop blur overlay
- Organized sections:
  - Profile (avatar, name, email)
  - App Settings (dark mode, notifications)
  - Reading Preferences (font size, line spacing, goals)
- Logout functionality at bottom
- Version display
- Fully responsive

**Props:**
- `isOpen` (boolean) - Whether panel is visible
- `onClose` () => void - Close callback

**Sections:**

#### Profile Section
- User avatar (generated from email initial)
- User name (or username)
- Email address
- "Edit profile" option (ready for implementation)

#### App Settings
- **Dark Mode Toggle** - Switch between light/dark themes
- **Notifications Toggle** - Enable/disable reading reminders

#### Reading Preferences
- **Font Size** - Adjust reading text size (ready for implementation)
- **Line Spacing** - Control text line height (ready for implementation)
- **Reading Goal** - Set daily/weekly reading targets (ready for implementation)

#### Footer
- **Logout Button** - Large, prominent logout with loading state
- **Version Number** - App version display

**Usage:**
```tsx
import { useState } from "react";
import { SettingsPanel } from "@/components/settings/settings-panel";

function MyComponent() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <button onClick={() => setShowSettings(true)}>
        Open Settings
      </button>
      
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
```

---

## Styling

### CSS Architecture

All styles are in SCSS modules in `styles/components/`:

- `_app-header.scss` - Header styles
- `_app-layout.scss` - Layout container styles  
- `_settings-panel.scss` - Settings panel styles

### Design System

**Colors:**
- Uses CSS variables from `_variables.scss`
- Consistent with paper-inspired aesthetic
- Subtle transparency with backdrop-filter

**Typography:**
- Header: 1.25rem, bold, tight letter-spacing
- Body: 0.8-0.9rem, medium weight
- Labels: Uppercase, tracked, secondary color

**Spacing:**
- Consistent padding: 48px desktop, 24px mobile
- Gap between elements: 16-24px
- Tight grouping for related items

**Interactions:**
- 180ms transitions for smoothness
- Hover states with subtle color/background changes
- Active states with slight scale transform
- Focus states for accessibility

**Animations:**
- Panel slide-in: 250ms ease
- Backdrop fade-in: 200ms ease
- Toggle switch: 200ms ease
- All smooth and performant

---

## Responsive Design

### Breakpoints

**Desktop (> 800px):**
- Full header with all elements
- Settings panel: 420px width
- Full text labels everywhere

**Tablet (500px - 800px):**
- Condensed header padding
- Hide user email in header
- Settings panel: 420px width
- Keep text labels

**Mobile (< 500px):**
- Compact header padding (24px)
- Icon-only settings button (circular)
- Settings panel: full width
- Smaller text sizes

**Small Mobile (< 380px):**
- Further reduced font sizes
- Compact profile display
- Optimized touch targets

---

## Hide on Zoom Feature

When a user opens a book in reading/zoom mode, the header automatically hides to provide distraction-free reading.

### Implementation

1. **Set up the layout with hide on zoom:**
```tsx
<AppLayout hideHeaderOnZoom={true}>
  <BookReader />
</AppLayout>
```

2. **Trigger zoom state from your book reader:**
```tsx
// In your book reader component
function BookReader() {
  const [isZoomed, setIsZoomed] = useState(false);

  const enterZoomMode = () => {
    setIsZoomed(true);
    window.dispatchEvent(
      new CustomEvent("zoomchange", {
        detail: { zoomed: true }
      })
    );
  };

  const exitZoomMode = () => {
    setIsZoomed(false);
    window.dispatchEvent(
      new CustomEvent("zoomchange", {
        detail: { zoomed: false }
      })
    );
  };

  return (
    <div>
      <button onClick={enterZoomMode}>Enter Reading Mode</button>
      {isZoomed && (
        <button onClick={exitZoomMode}>Exit</button>
      )}
    </div>
  );
}
```

### How It Works

1. Header listens for `zoomchange` custom events
2. When `zoomed: true`, header slides up and fades out
3. Transition is smooth (300ms) with opacity fade
4. `pointer-events: none` prevents interaction when hidden
5. When `zoomed: false`, header slides back down

---

## Settings Implementation

### Current Settings

**Implemented with State:**
- Dark mode toggle (UI ready, state management ready)
- Notifications toggle (UI ready, state management ready)

**UI Ready (For Implementation):**
- Edit profile
- Font size selection
- Line spacing selection
- Reading goal setting

### Adding New Settings

To add a new setting option:

1. **Add a toggle setting:**
```tsx
const [mySetting, setMySetting] = useState(false);

<div className="settings-toggle">
  <div className="settings-toggle__info">
    <YourIcon size={16} />
    <div>
      <p className="settings-toggle__label">Setting Name</p>
      <p className="settings-toggle__description">
        Description of what this does
      </p>
    </div>
  </div>
  <button
    className={`settings-toggle__switch ${
      mySetting ? "settings-toggle__switch--active" : ""
    }`}
    onClick={() => setMySetting(!mySetting)}
    role="switch"
    aria-checked={mySetting}
  >
    <span className="settings-toggle__switch-handle" />
  </button>
</div>
```

2. **Add a clickable option:**
```tsx
<button className="settings-option">
  <div className="settings-option__content">
    <YourIcon size={16} />
    <span>Option Name</span>
  </div>
  <div className="settings-option__value">
    Current Value
    <ChevronRight size={16} className="settings-option__arrow" />
  </div>
</button>
```

3. **Add a new section:**
```tsx
<section className="settings-section">
  <div className="settings-section__header">
    <YourIcon size={18} />
    <h3>Section Title</h3>
  </div>
  
  {/* Your settings options here */}
</section>
```

---

## Accessibility

### Keyboard Navigation
- All interactive elements focusable
- Settings panel closes with Escape key (ready for implementation)
- Logical tab order

### Screen Readers
- Proper ARIA labels on buttons
- `role="switch"` on toggle buttons
- `aria-checked` states on toggles
- Semantic HTML structure

### Visual Accessibility
- High contrast colors
- Minimum 44px touch targets on mobile
- Clear focus indicators
- No reliance on color alone

---

## Performance

### Optimizations
- Conditional rendering (panel only renders when open)
- CSS transforms for animations (GPU accelerated)
- Backdrop-filter for performant blur
- Smooth 60fps animations
- No layout thrashing

### Bundle Size
- Uses Lucide icons (tree-shakeable)
- Minimal component code
- Efficient SCSS with variables
- No heavy dependencies

---

## Usage Examples

### Example 1: Library Page
```tsx
import { AppLayout } from "@/components/layout/app-layout";

export default function LibraryPage() {
  return (
    <AppLayout hideHeaderOnZoom={true}>
      <div className="library-content">
        {/* Your library content */}
      </div>
    </AppLayout>
  );
}
```

### Example 2: Book Reader Page
```tsx
import { AppLayout } from "@/components/layout/app-layout";

export default function BookReaderPage() {
  return (
    <AppLayout hideHeaderOnZoom={true}>
      <BookReader />
    </AppLayout>
  );
}
```

### Example 3: Regular Page (No Hide on Zoom)
```tsx
import { AppLayout } from "@/components/layout/app-layout";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div>Settings page content</div>
    </AppLayout>
  );
}
```

### Example 4: Page Without Header
```tsx
import { AppLayout } from "@/components/layout/app-layout";

export default function FullscreenPage() {
  return (
    <AppLayout showHeader={false}>
      <div>Fullscreen content</div>
    </AppLayout>
  );
}
```

---

## Future Enhancements

### Planned Features
- [ ] Persist dark mode preference
- [ ] Connect notifications to backend
- [ ] Implement font size adjustment
- [ ] Implement line spacing adjustment
- [ ] Add reading goal tracking
- [ ] Add profile editing
- [ ] Add keyboard shortcuts
- [ ] Add settings search
- [ ] Add export data option
- [ ] Add privacy settings

### Possible Additions
- Theme customization (colors, fonts)
- Language selection
- Accessibility settings (high contrast, large text)
- Data management (backup, restore)
- Account deletion
- Two-factor authentication setup

---

## Troubleshooting

### Panel Not Opening
- Check `isOpen` prop is being set to `true`
- Verify no z-index conflicts
- Check console for errors

### Header Not Hiding on Zoom
- Ensure `hideHeaderOnZoom={true}` is set on AppLayout
- Verify custom event is being dispatched correctly
- Check event detail structure: `{ zoomed: true/false }`

### Settings Not Persisting
- Currently settings are in local state only
- To persist, connect to backend or localStorage
- See "Adding New Settings" section for implementation

### Styling Issues
- Check SCSS imports in `globals.scss`
- Verify CSS variable names match `_variables.scss`
- Clear browser cache and rebuild

---

## Summary

The new layout system provides:
✅ Reusable header component
✅ Comprehensive settings panel
✅ Hide-on-zoom functionality for reading mode
✅ Fully responsive design
✅ Accessible implementation
✅ Consistent design system
✅ Easy to extend and customize

The header and settings panel are now ready to use across all protected pages in your app!
