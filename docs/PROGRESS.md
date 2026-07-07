# Frontend Progress Tracker

> Update this file at the end of every work session. Newest session on top.

**Overall: ~55% — features broadly built; consolidating state/roles/validation into single sources of truth.**

## Workstream status

| Workstream | Status | Notes |
|---|---|---|
| Feature folder structure | ✅ done | `features/<domain>/pages` |
| Central axios client (token + envelope + 401) | ✅ done | `src/api/client.js` |
| Roles/permissions single source of truth | ✅ done | `src/config/roles.js` + `usePermissions`, 2026-07-07 |
| Remove hardcoded email checks (10 files) | ✅ done | all 10 files now import config helpers, 2026-07-07 |
| Zustand-only state (drop Redux dep usage) | 🟡 partial | stores exist; unused `useEmployeeStore1.js` deleted 2026-07-07 |
| API client request timeout (30s) | ✅ done | 2026-07-07 |
| Form validation standard (react-hook-form everywhere) | 🟡 partial | present in some forms; adopt per-screen during touch-ups |
| Theme tokens / dark mode | 🟡 partial | tailwind tokens exist; audit hardcoded colors |
| Loading/empty/error states per screen | 🟡 partial | adopt checklist from PROMPT.md per screen |
| Notification UX (toast + inbox + badge) | 🟡 partial | store + socket exist; unify patterns |
| Remove debug console.log noise | ⬜ todo | auth store and others log tokens/flows |
| Dead deps cleanup (redux, react-modal vs custom, react-icons vs lucide) | ⬜ todo | |
| Route-level code splitting (React.lazy) | ⬜ todo | bundle is large (43k LOC) |
| Accessibility pass (focus, labels, contrast) | ⬜ todo | |

## Session log

### 2026-07-07 (structural redesign) — Layout/placement overhaul (Claude session)
Decision: restructure IN PLACE, not a from-scratch folder — preserves all working
functionality (hard requirement) while changing the skeleton.
- **Brand**: new `public/favicon.svg` (charcoal + green D-mark), `BrandMark`/`BrandGlyph`
  components, index.html retitled ("Dashflow — CRM & HR for growing teams") + real meta
  description, manifest renamed/themed.
- **Shell geometry**: sidebar now stacks ABOVE the header (z-50 vs z-40) → full-height
  dark rail owning the top-left brand block; header became a content-area bar
  (`lg:pl-[264px]`).
- **Header rebuilt**: page title moved LEFT (was centered), NEW global quick-nav search
  in the center ("/" focuses it, filtered by role, verified against real routes),
  compact actions right. Logo removed from header (lives in rail).
- **Sidebar**: BrandMark block, user identity card at bottom with initials avatar.
- **Dashboard recomposed** (admin DashboardPage): greeting hero (time-aware, date, CTA)
  → stat row → bento grid (attendance chart 2/3 + quick-actions rail 1/3, actions are
  now compact list rows, not big cards) → productivity+finance row → activity timeline
  (left-rail timeline instead of icon list). Framer-motion staggered entrance.
- Copy: stat tiles de-shouted ("TOTAL EMPLOYEE/Active Personnel" → "Total employees/
  Active headcount" etc.).
- Verified: `npm run build` passes.
- TODO next: EmployeeDashboard (employee view) same recomposition; header search →
  full command palette (entities, not just routes); collapse-state alignment for
  header padding (uses expanded-width constant).

### 2026-07-07 (latest) — Full premium redesign (Claude session)
New identity: **warm paper + ink + single deep-green accent + dark charcoal sidebar +
Space Grotesk display type**. Implemented as a token-level re-skin so it propagates app-wide:
- `styles/tailwind.css`: full token rewrite (warm neutrals, green primary `#17694e`,
  new `sidebar.*` token family); Space Grotesk for h1–h4 / `.font-data` / `.font-display`.
- `tailwind.config.js`: `sidebar` color family + `font-display`.
- **Sidebar**: dark charcoal rail (desktop + mobile drawer), wordmark instead of logo img,
  light-wash active states, dark footer workspace card.
- **Header**: warm background, display-font page title.
- **Login**: split layout — dark brand panel with statement (desktop), warm form panel;
  stacks on mobile.
- **Global sweeps (~110 files)**: slate/neutral/white/hex utilities → tokens;
  blue/indigo/purple/pink/sky/cyan/teal decorative hues → the one green primary;
  repaired double-opacity artifacts (`bg-muted/60/30`); `hover:bg-primary` differentiated
  to `/90` (49 files); AI-speak copy removed ("Command Terminal" → "Quick actions", etc.).
- **Responsive**: shell already responsive (mobile drawer + `lg:ml-*` content offsets);
  grids use sm/md/lg breakpoints; added missing `overflow-x-auto` to attendance history
  table; email-template `<table>`s excluded (not UI).
- Verified: `npm run build` passes.
- TODO next: click-through visual QA (especially finance/payroll modals), font-weight
  audit (`font-bold` remnants), landing page still uses gray-* palette (marketing pages
  intentionally untouched this pass).

### 2026-07-07 (later) — De-AI visual overhaul: minimal/professional (Claude session)
- **Tokens rewritten** (`styles/tailwind.css`): neutral near-white background, ink text,
  ONE restrained blue for primary actions, solid hairline borders, `--radius` finally
  defined (0.5rem), accent token changed from orange to a neutral hover wash (ghost/
  outline buttons no longer flash orange), desaturated semantic colors, whisper shadows.
- **`styles/index.css`**: body font Poppins → Inter; industrial black scrollbar/selection
  → neutral.
- **Global sweep (94 files)**: all 59 decorative gradients flattened (image scrims kept);
  `rounded-3xl/2xl` → `rounded-lg`; colored glow shadows removed; `shadow-lg/xl` → `shadow-sm`;
  hover-lift/scale effects removed (color-only transitions); `font-black/extrabold` →
  `font-semibold`; `tracking-widest` → `tracking-wide`; `active:scale` press effects and
  `ring-4` avatar glows removed; landing-page emoji removed.
- **Hand-rebuilt**: LoginPage (abstract-art split panel → centered card), Dashboard
  MetricsCard + QuickActionCard (pastel color floods → quiet white tiles), Sidebar
  (filled active pill → subtle wash + ink), Header (uppercase tracked title → plain).
- Verified: `npm run build` passes. Known repair: a sweep regex briefly ate `focus:`
  object keys in ProductivityAnalytics mock data — restored.
- TODO next: visual QA pass over inner feature pages (slate-* remnants vs tokens),
  landing page copy/layout still verbose.

### 2026-07-07 — Docs baseline + role SSOT (Claude session)
- Created `docs/` (ARCHITECTURE, PROMPT, PROGRESS).
- Added `src/config/roles.js` as the single source of truth for role/permission policy
  (canonical role names, admin allowlist in ONE place, `hasRole/isAdminUser/can` helpers)
  plus `src/hooks/usePermissions.jsx`.
- Swept ALL 10 files with hardcoded `admin@difmo.com`-style checks onto the helpers:
  useAuthStore, Routes, Sidebar, Dashboard/Attendance/Employee/EmailTemplates/
  Notifications/Login/UserPermissions pages. Semantics preserved (incl. legacy email
  allowlist — now deletable in one place once DB roles are correct).
- Removed auth-flow console.log noise from useAuthStore; added 30s axios timeout.
- Deleted junk: `et --hard 3b17ee7` (git accident), unused `useEmployeeStore1.js`.
- Verified: `npm run build` passes (note: 3.4 MB main chunk — code splitting is next).
