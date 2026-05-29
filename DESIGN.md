# LifePet Care OS — Design System

## 1. Visual Theme & Atmosphere
The **LifePet Care OS** identity is defined by three pillars: **Clarity, Trust, and Warmth**. 
- **Clarity (Linear-inspired):** High-precision layouts, consistent grids, and no-nonsense organization.
- **Trust (Stripe-inspired):** Visual depth through subtle layering, professional typography, and premium shadows.
- **Warmth (Intercom-inspired):** Friendly copy, rounded corners, and a clean, welcoming atmosphere that feels human.

## 2. Color Palette & Roles
We use a strictly defined palette to maintain brand integrity:

| Role | Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | Petroleum Blue | `#007C92` | Main brand color, sidebars, primary actions. |
| **Primary Dark** | Dark Petroleum | `#006B80` | Hover states, active sidebar items. |
| **Accent** | Cyan | `#00C7D9` | Highlights, links, specific active indicators. |
| **Button** | Action Blue | `#009FD1` | Call to action buttons. |
| **Background** | Soft Gray/Cyan | `#F4F7F8` | Main page backgrounds (clean & calm). |
| **Surface** | White | `#FFFFFF` | Cards, modals, containers. |
| **Input** | Neutral Tint | `#F1F1F3` | Form fields and search bars. |
| **Text** | Slate Dark | `#0F172A` | Primary headings and body text. |
| **Muted** | Slate Gray | `#64748B` | Secondary info, captions, placeholders. |

## 3. Typography Rules
- **Font Family:** Inter (System-ui fallback).
- **Scale:**
  - `h1`: 2.25rem (3xl), font-black, tracking-tighter.
  - `h2`: 1.875rem (2xl), font-extrabold, tracking-tight.
  - `h3`: 1.25rem (xl), font-bold.
  - `body`: 0.875rem (sm) to 1rem (base), font-medium.
  - `small`: 0.75rem (xs), font-bold, uppercase, tracking-widest.

## 4. Layout Principles
- **Grid:** 12-column system for desktop.
- **Spacing:** Multiples of 4 (4px, 8px, 16px, 24px, 32px, 48px).
- **Safe Zones:** 32px (8 units) minimum horizontal padding on internal pages.
- **Max Width:** Content area max-width of 1280px (7xl).

## 5. Component Styling: Cards & Surfaces
- **Shadows:** `shadow-sm` for default, `shadow-xl` for overlays.
- **Borders:** `1px solid #E5E7EB` (Slate-200). Use sparingly.
- **Corners:** `rounded-2xl` (1rem) for cards, `rounded-3xl` (1.5rem) for large containers.
- **Depth:** Cards should feel slightly elevated above the `#F4F7F8` background.

## 6. Buttons
- **Primary:** `#009FD1` background, bold text, shadow, 12px vertical padding.
- **Secondary:** White background, Slate-200 border, dark text.
- **Danger:** Soft red background, red text, red border.
- **Interaction:** `hover:scale-[1.02]` or subtle background shift. `active:scale-[0.98]`.

## 7. Inputs & Forms
- **Field:** Soft gray background (`#F1F1F3`), no border by default, `focus:ring-2` with accent color.
- **Labels:** Small, bold, slightly muted to let the input/content shine.
- **Groups:** Consistent 24px vertical gap between form groups.

## 8. Status Badges
- **Success:** Emerald green.
- **Warning:** Amber gold.
- **Danger:** Bright red.
- **Info:** Sky blue.
- **Style:** Small, pill-shaped, bold uppercase text.

## 9. Sidebar & Header
- **Sidebar:** Fixed width (64 units), Primary color background, high-contrast icons.
- **Header:** White background, bottom border, page title on the left, profile on the right.
- **Active State:** Cyan accent (`#00C7D9`) for icons and subtle background change.

## 10. Auth Pages (60/40 Pattern)
- **Left (60%):** Brand showcase. Large logo, clean background, institutional message.
- **Right (40%):** Focus. Dark primary background, centered form card, high contrast.

## 11. Responsive Behavior
- **Mobile (<768px):** Sidebar collapses into a drawer. Horizontal padding reduces to 16px.
- **Tablet (768px - 1024px):** Grid columns reduce (3 to 2).
- **Desktop (>1024px):** Full sidebar and multi-column dashboards.

## 12. Do's and Don'ts
### Do:
- Use consistent `rounded-2xl`.
- Maintain a clear hierarchy (Big titles, small muted captions).
- Use white space to group related elements (Linear style).
- Reference the logo via `/assets/logos/lifepet-logo.svg`.

### Don't:
- Use Tailwind CDN.
- Create messy inline styles.
- Change button heights between pages.
- Use hard black (`#000000`) for text.

## 13. Agent Prompt Guide
"When building for LifePet, prioritize visual depth and clarity. Headings should be bold and tight. Surfaces should be white and rounded. Use the official petroleum and cyan palette exclusively."
