# Dash-flow Frontend — Architecture

> Stack: **React 18 · Vite 5 · Tailwind CSS 3 · Zustand (global state) · React Router 6 ·
> react-hook-form (forms) · Axios · Socket.IO client · Firebase (FCM) · Recharts/D3.**

## Layout

```
src/
├── index.jsx / App.jsx / Routes.jsx   # entry, providers, route table
├── api/
│   ├── client.js         # THE axios instance: auth header, envelope unwrap, 401 handling
│   └── endpoints.js      # endpoint path constants
├── config/               # single-source-of-truth constants
│   └── roles.js          # roles, permissions, admin policy — the ONLY place role logic lives
├── store/                # Zustand stores (one per domain)
├── services/             # api-calling functions used by stores/pages
├── features/<domain>/    # pages + feature components per domain
│   └── pages/
├── components/           # shared components
│   └── ui/               # design-system primitives (Button, Sidebar, ...)
├── hooks/                # shared hooks (usePermissions, ...)
├── styles/               # tailwind layers, theme tokens
└── utils/                # pure helpers
```

## State management — rules

- **Zustand is the global state library.** One store per domain in `src/store/`.
  (`@reduxjs/toolkit` is a legacy dependency — do not add Redux code.)
- Server data lives in stores; components subscribe with selectors, never copy store
  state into `useState`.
- Auth state (`useAuthStore`) is the single source of truth for user/token/roles.
  Token persistence in `localStorage` is handled ONLY inside the auth store.

## Role & permission model — single source of truth

All role logic flows from `src/config/roles.js` + the `can()` helper on `useAuthStore`:

- `ROLES` — canonical role names.
- `isAdminUser(user)` / `hasRole(user, role)` / `can(action, resource)`.
- **No component may compare emails or role strings inline.** Import the helpers.
- Frontend checks are UX only (hide/disable). The backend re-enforces everything.

Route protection: `ProtectedRoute` (authentication) and role-gated routes in
`Routes.jsx` using the same helpers.

## API layer — rules

- All HTTP goes through `src/api/client.js`. It:
  - injects the Bearer token,
  - unwraps the backend envelope `{ statusCode, message, data }` → `data`,
  - on 401 clears auth and redirects to `/login`.
- Feature code calls `services/*.service.js` functions; components never import axios.

## Forms & validation

- `react-hook-form` for every form; validation rules colocated with the form via a
  schema object in the feature folder. Show field-level errors; never rely on the
  backend 400 as the only feedback.

## UI system

- Tailwind with design tokens (CSS variables) in `src/styles/` — colors, radius,
  elevation come from tokens, never hardcoded hex in components.
- Primitives in `components/ui/` (CVA variants); features compose primitives.
- Feedback: `react-hot-toast` for transient results; skeletons for loading states;
  `ErrorBoundary` wraps the route tree.
- Icons: `lucide-react` (don't mix with react-icons in new code).

## Realtime

- Socket.IO client connects after login (user room) → feeds `useNotificationStore`.
- FCM (Firebase) for background push; token registered with backend after permission grant.
