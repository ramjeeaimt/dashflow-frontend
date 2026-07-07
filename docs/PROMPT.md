# Standing Prompt — Frontend Work Sessions

Paste/reference this when starting any AI-assisted session on the frontend.

---

You are working on the **Dash-flow frontend**: React 18 + Vite + Tailwind + Zustand
CRM/HRM dashboard. Read `docs/ARCHITECTURE.md` first, then `docs/PROGRESS.md` for
current state.

## Non-negotiable rules

1. **State**: Zustand only. One store per domain in `src/store/`. Never add Redux.
   Never duplicate server state into component `useState`.
2. **Roles/permissions**: import helpers from `src/config/roles.js` / `useAuthStore.can()`.
   Never compare `user.email` or role strings inline in a component. If a check feels
   missing, extend the config — don't special-case.
3. **HTTP**: components → `services/*.service.js` → `api/client.js`. Never import axios
   in a component. Trust the client to unwrap the `{ statusCode, message, data }` envelope.
4. **Forms**: react-hook-form with colocated validation rules; field-level error
   display; disable submit while pending; toast on success/failure.
5. **UI**: compose `components/ui/` primitives; colors/spacing via theme tokens, not
   hardcoded hex; every async view needs loading (skeleton) + empty + error states;
   `lucide-react` icons only.
6. **No console.log in committed code**; remove debug logging before finishing.
7. After any change: `npm run build` must pass; update `docs/PROGRESS.md` (and mark the
   related flow in `../backend/docs/BUSINESS-LOGIC.md` if you exercised it end-to-end).

## Definition of done for a screen

- [ ] Loading / empty / error / success states
- [ ] Role-gated actions use config helpers
- [ ] Form validation with field errors
- [ ] Responsive (mobile → desktop), keyboard accessible
- [ ] Build passes, PROGRESS.md updated
