# Hartwell Primary School — Sustainable Travel System Design Specification (`DESIGN.md`)

Comprehensive design system, colour tokens, typography, viewport form factors, accessibility standards, and UI component conventions for the **Hartwell Primary School Sustainable Travel System Prototype (S1–S9)**.

---

## 1. Brand Identity & Design Philosophy

- **Institution**: Hartwell Primary School (Camberwell, Victoria 3124 — City of Boroondara)
- **Motto**: *"Strive for the Highest"* (Est. 1922)
- **Crest Asset**: `/public/assets/hartwell-crest-mask.png` (aspect ratio `431 / 379`, rendered via CSS mask for adaptive theme tinting)
- **Aesthetic Direction**:
  - **Real Site Mode**: Editorial primary school portal combining warm heritage serif headings (`Georgia`) with high-legibility modern sans-serif UI controls (`Inter`), deep forest greens (`#123E2B` / `#1B5E20`), and soft cream/slate surfaces.
  - **Figma Canvas Mode**: Multi-viewport CASE engineering workspace featuring a dark slate studio surround (`#0F172A` / `#1E293B`), traceability sidebar, live viewport switcher (`440px` handheld vs `960px` desktop/smartboard), and version history attribution drawer.

---

## 2. Colour System & Global Design Tokens

The prototype supports **<10-second global colour token swapping** via `[data-theme]` on `<body>` and `.prototype-root` ([app/globals.css](file:///home/sofia/Documents/GitHub/nextjs-boilerplate/app/globals.css#L3-L88)), plus **Dark Mode**, **WCAG 2.2 AAA High-Contrast Mode**, and the **Auth Shell Forest Palette**.

### 2.1 Scheme B: Boroondara Eco-Safe Green (Client Selected — Default)
Selector: `:root, [data-theme="scheme-b"]`
- **WCAG Contrast**: `11.4:1` AAA primary text-on-banner contrast; optimized for outdoor morning glare (`08:15–09:00 AM`).

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--primary` | `#1B5E20` | Primary brand headers, active buttons, primary borders |
| `--primary-dark` | `#0F3D13` | Device status bar, deep banner accents |
| `--primary-mid` | `#2E7D32` | Hover states, secondary fills |
| `--primary-light` | `#E8F5E9` | Metric box fills, requirement pills, success banner background |
| `--secondary` | `#00796B` | Form input focus/borders, secondary action buttons, header bottom accent |
| `--secondary-light` | `#E0F2F1` | Subtle secondary highlights |
| `--bg-app` | `#F8FAFC` | App viewport canvas background |
| `--bg-card` | `#FFFFFF` | Card container surface |
| `--text-main` | `#111827` | Primary body & heading copy |
| `--text-muted` | `#4B5563` | Subtitles, metadata hints, helper captions |
| `--border-color` | `#CBD5E1` | Card & row dividers |

### 2.2 Scheme A: Municipal Corporate Navy (Client Rejected — Comparison Baseline)
Selector: `[data-theme="scheme-a"]`

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--primary` | `#1E3A8A` | Navy header & primary actions |
| `--primary-dark` | `#172554` | Status bar & dark accents |
| `--primary-mid` | `#1D4ED8` | Interactive active states |
| `--primary-light` | `#DBEAFE` | Metric & badge backgrounds |
| `--secondary` | `#0284C7` | Secondary sky-blue accents & input borders |
| `--secondary-light` | `#E0F2FE` | Light sky-blue surface tint |
| `--bg-app` | `#F1F5F9` | Slate app background |
| `--bg-card` | `#FFFFFF` | Card container surface |
| `--text-main` | `#334155` | Slate primary text |
| `--text-muted` | `#64748B` | Muted slate captions |
| `--border-color` | `#CBD5E1` | Structural borders |

### 2.3 Semantic Status, Hazard & Gamification Tokens

| Category | Background Token | Border Token | Text Token | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Success / Verified** | `#DCFCE7` / `--primary-light` | `#16A34A` / `--primary` | `#166534` / `--primary-dark` | Checked-in status pills (`08:22 AM Checked In`), 0.38s SLA banners |
| **Amber Hazard (BOM / Caution)** | `--alert-amber-bg` (`#FEF3C7`) | `--alert-amber-border` (`#D97706`) | `--alert-amber-text` (`#92400E`) | S4 BOM weather squall warnings, S5 CR-01 detour banners, pending check-in |
| **Crimson Alert (9AM SOS / Blocked)** | `--alert-crimson-bg` (`#FEE2E2`) | `--alert-crimson-border` (`#B91C1C`) | `--alert-crimson-text` (`#991B1B`) | S3 9:00 AM unaccounted student SOS alert, blocked road crossings |
| **Gold Gamification (S8 Trophy)** | `--gold-bg` (`#FEF9C3`) | `--gold-border` (`#CA8A04`) | `--gold-text` (`#854D0E`) | S8 Golden Boot leaderboard 1st-place podium & Walking Wednesday highlights |

### 2.4 Real-Site Editorial & Authentication Palette (`app/auth.css` & MUI Theme)
Used on `/parent-login`, `/parent-signup`, `/admin-login`, and Real-Site Mode chrome ([app/auth.css](file:///home/sofia/Documents/GitHub/nextjs-boilerplate/app/auth.css#L1-L16), [MuiProvider.tsx](file:///home/sofia/Documents/GitHub/nextjs-boilerplate/app/components/MuiProvider.tsx#L8-L43)):

| Token | Hex | Role |
| :--- | :--- | :--- |
| `--forest` | `#123E2B` | Primary Real-Site header, auth story panel, primary buttons |
| `--forest-deep` | `#0A2B1D` | Commute status strip, deep hero gradients, dark button variant |
| `--leaf` | `#2F7D4D` | Focus rings (`3px solid #2F7D4D`), links, avatar badges |
| `--leaf-bright` | `#53A36E` | Eyebrow kickers, active navigation indicators |
| `--mint` | `#E9F4EC` | Soft badge fills, rubric chips |
| `--cream` | `#F7F5EE` | Editorial background canvas |
| `--ink` | `#17221C` | High-contrast editorial body text |
| `--muted` | `#647069` | Secondary form labels & footnotes |
| `--line` | `#D8E1DA` | Editorial card & footer borders |
| `--danger` | `#A7352C` | Validation error text & borders |

### 2.5 Dark Mode & High-Contrast Mode Overrides
- **Dark Mode** (`body[data-dark-mode="true"]`):
  - `--bg-app`: `#0F172A`, `--bg-card`: `#1E293B`, `--text-main`: `#F8FAFC`, `--text-muted`: `#94A3B8`, `--primary`: `#4ADE80`, `--secondary`: `#2DD4BF`.
- **High-Contrast Mode** (`body[data-high-contrast="true"]` — WCAG 2.2 AAA):
  - Pure black/white surfaces (`#000000` / `#FFFFFF`) with high-visibility safety yellow (`#FFD400` / `#FFF3A3`) focus rings (`3px solid #FFD400`) and active navigation states.

---

## 3. Typography

Defined in [app/globals.css](file:///home/sofia/Documents/GitHub/nextjs-boilerplate/app/globals.css), [app/auth.css](file:///home/sofia/Documents/GitHub/nextjs-boilerplate/app/auth.css), and [app/components/MuiProvider.tsx](file:///home/sofia/Documents/GitHub/nextjs-boilerplate/app/components/MuiProvider.tsx).

### 3.1 Font Stacks
- **Primary UI & Controls (Sans-Serif)**:
  ```css
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  ```
- **Editorial Headings & School Branding (Serif — Real-Site Mode & Auth Story Panel)**:
  ```css
  font-family: Georgia, "Times New Roman", serif;
  ```
- **Telemetry, URLs, OTP Codes & Rubric Badges (Monospace)**:
  ```css
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  ```

### 3.2 Type Scale & Hierarchy

| Element | Font Family | Size | Weight | Tracking / Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Real-Site Hero Heading** (`.real-site-heading`) | `Georgia, serif` | `clamp(30px, 3.5vw, 44px)` | `500` | `-0.03em` / `1.08` |
| **Auth Story Panel Title** (`h1#welcome-title`) | `Georgia, serif` | `clamp(32px, 3.4vw, 46px)` | `500` | `-0.03em` / `1.08` |
| **Real-Site Card Title** (`.real-site-mode .card-title`) | `Georgia, serif` | `19px` | `500` | `-0.02em` / `1.25` |
| **OTP Digit Box** (`.otp-digit`) | `Inter` / `monospace` | `18px` | `800` | `42px × 44px` box |
| **App Header School Title** (`.school-title`) | `Inter, sans-serif` | `16px` | `800` | `-0.2px` / `1.2` |
| **Metric Value** (`.metric-val`) | `Inter, sans-serif` | `15px` | `800` | Tight numeric |
| **Standard Input / Button** (`.input-box`, `.btn-primary`) | `Inter, sans-serif` | `13px–14px` | `600–800` | Normal |
| **Figma Card Title** (`.card-title`) | `Inter, sans-serif` | `13px` | `800` | `0.3px` (Uppercase) |
| **Body / Roster Row** (`.roster-row`) | `Inter, sans-serif` | `12px` | `600` | `1.4` |
| **Form Label** (`.form-label`) | `Inter, sans-serif` | `11.5px` | `700` | Flex space-between |
| **Rubric & Status Pills** (`.req-pill`, `.nav-req-badge`) | `Inter` / `monospace` | `9.5px–10.5px` | `700–800` | Compact badge |

### 3.3 Accessibility Font Scaling (`#prototype-viewport[data-font-scale]`)
Controlled via the **Settings Drawer ("Bigger text")** or **Screen S9 ("Interface Typography Scaling Slider")**:
- `data-font-scale="100"`: `100%` Default (`zoom: 1`)
- `data-font-scale="125"`: `125%` Large (`zoom: 1.12`)
- `data-font-scale="150"`: `150%` Extra High (`zoom: 1.24`)

---

## 4. Layout & Multi-Viewport Form Factors

The system adapts across two primary workspace modes and two device form factors:

### 4.1 Workspace Modes
1. **Real Site Mode (`.prototype-root.real-site-mode`)**:
   - Full-bleed responsive web application (`max-width: 1240px` content container, `padding: 22px clamp(20px, 5vw, 48px)`).
   - Includes live BOM Weather & VicRoads status strip (`.commute-status-strip`), role-filtered horizontal subnav (`.real-site-subnav`), editorial hero header, and 3-column school footer (`.real-site-footer`).
   - Screens `S1–S5` (handheld field tools) render inside a centred `580px` max-width card boundary on desktop, collapsing cleanly to full-width on mobile (`<= 640px`).
2. **Figma Canvas Mode (Default `.prototype-root`)**:
   - Studio layout with left `290px` traceability sidebar (`.sidebar`), centre radial-gradient stage (`.stage`), and right collapsible version-history attribution drawer (`.version-history-drawer`).

### 4.2 Device Viewport Frame (`.device-frame`)
- **Mobile Handheld Frame (`440px × min 750px`)**:
  - Default for **Sofia Mironenko's field screens (`S1–S5`)** — designed for one-handed roadside operation by a Duty Route Assistant in wet or bright morning conditions (`border-radius: 28px`, `8px solid #334155` bezel).
- **Wide Desktop / Classroom Smartboard Frame (`.device-frame.desktop-frame`, `960px × min 680px`)**:
  - Default for **Kim Le's operational & classroom screens (`S6–S9`)** — includes simulated browser chrome bar (`.browser-chrome-bar` with window dots and SSL intranet URL bar) and a responsive 2-column `.desktop-split` grid (`1.15fr 0.85fr`).

---

## 5. Core UI Components & Interaction Patterns

- **Constrained Controls (Nielsen Heuristic #5 — Error Prevention)**:
  - Constrained `<select className="select-box">` dropdowns for 500m Drop-Off Hubs (`S2`, `S5`, `S6`) and telemetry windows (`S8`) instead of error-prone free-text entry.
  - Segmented 3-way controls (`.segmented-control` / `.seg-btn`) for role selection (`S1`), roster filtering (`S2`), hazard severity (`S4`), and font scaling (`S9`).
- **Two-Step Confirmation Modals (`.modal-backdrop` / `.modal-card`)**:
  - Used on `S3` (*Confirm 9:00 AM Absence SOS & Walk Termination*) and Sign-Out to prevent accidental single-tap triggers in wet roadside conditions.
- **Interactive Map Switcher (`.map-toggle-group`)**:
  - Switches on `S5` and `S7` between the schematic **Safe Corridor** checkpoint view (`.map-box`) and live embedded **Google Maps API** (`iframe` inside `.google-maps-frame`).
- **Accessibility & Preferences Sheet (`#settings-panel`)**:
  - Slide-over dialog supporting instant persona switching (`Parent`, `Teacher`, `Admin`), Dark Mode, Scheme A/B swap, High Contrast, Bigger Text, Reduced Motion, and Rubric Code visibility.
