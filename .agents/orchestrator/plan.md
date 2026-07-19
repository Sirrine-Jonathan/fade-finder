# Master Execution Plan: Fade Finder

## Objective
Implement all features, design modernizations, routes, tech debt refactoring, atomic components, PWA features, and testing suites for `fade-finder` according to `PLAN.md`, `TODO.md`, and `requirements.md`. Adhere strictly to the git workflow in `TODO.md` for every feature (branch off main -> commits -> PR -> merge).

---

## Architecture & Work Division

```
               [Project Orchestrator]
                         │
      ┌──────────────────┴──────────────────┐
      ▼                                     ▼
 [Implementation Track]           [E2E Testing Track]
  ├── M1: DB & Auth Foundation     ├── TEST_INFRA.md & Test Suite
  ├── M3: Styled UI & PWA          ├── Tier 1 (Feature Coverage)
  ├── M4: Consumer App             ├── Tier 2 (Boundary & Corner)
  ├── M5: Provider App             ├── Tier 3 (Cross-Feature)
  ├── M6: Admin App                └── Tier 4 (Real-World Scenarios)
  └── M7: Final E2E Verification        └─► TEST_READY.md
       └── Tier 5 Adversarial Hardening
```

---

## Milestones & Branch Strategy

### Milestone 1: DB Schema, Seed Script & Auth API Foundation (`feature/db-auth-foundation`)
- **Git Branch**: `feature/db-auth-foundation`
- **Subtasks**:
  1. Update Prisma schema to add `slug` to `BarberProfile`, `verificationStatus` (PENDING, APPROVED, REJECTED), `mfaRecoveryKey` & `siteSettings` / CMS models if required.
  2. Extend `prisma/seed.ts` to include realistic mock barbers with unique slugs (e.g. `barber-dave`, `style-studio-jay`), verification status, service menus, client accounts, reviews, and appointments.
  3. Create `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`.
  4. Create `/api/barbers` (with search/filters/sorting logic) and `/api/barbers/[slug]`.
  5. Verify DB reset (`npm run db:reset`) and build.

### Milestone 2: Parallel E2E Testing Track (`feature/e2e-test-suite`)
- **Git Branch**: `feature/e2e-test-suite`
- **Subtasks**:
  1. Create `TEST_INFRA.md` defining test philosophy, runner configuration, and requirements coverage mapping.
  2. Implement Playwright test cases for:
     - Tier 1: Feature coverage for Client, Provider, Admin auth & navigation.
     - Tier 2: Boundary conditions (empty search results, invalid login, maximum distance limits).
     - Tier 3: Cross-feature interactions (Booking submission -> Provider approval -> Status update).
     - Tier 4: End-to-end application scenarios (full user journey from registration to completed appointment).
  3. Publish `TEST_READY.md` when test suite structure is verified.

### Milestone 3: Styled UI System, Atomic Components & PWA Modernization (`feature/ui-pwa-system`)
- **Git Branch**: `feature/ui-pwa-system`
- **Subtasks**:
  1. Add `styled-components` registry for Next.js App Router and define global styles/theme.
  2. Create atomic component library in `src/components/ui/` (`Button`, `Card`, `Input`, `Select`, `Modal`, `Navbar`, `Footer`, `Badge`, `RatingStars`, `MapPin`, `Toast`).
  3. Implement Modern Hero Section (full-width, high visual impact), display Logo prominently, remove "PWA" tag from header title.
  4. Implement PWA Manifest, Splash Screen, and Inline Dismissable PWA Install Prompt banner.
  5. Move "Reset DB" action out of public Navbar into Admin Settings.

### Milestone 4: Consumer (Client) App Experience (`feature/consumer-routes`)
- **Git Branch**: `feature/consumer-routes`
- **Subtasks**:
  1. `/login`: Forgot password link, register link, auth redirect logic.
  2. `/register`: Client signup page with pitch.
  3. `/`: Landing page (unauthenticated pitch vs authenticated dashboard with upcoming appointments & quick search CTAs).
  4. `/search`: Filter controls (in-shop vs house-call, min rating, max distance, favorites/all), sorting (price, rating, distance), interactive map pins, center location setting (GPS / address), search query input, clear filters/search, list/grid view toggle, barber cards.
  5. `/:barber-slug`: Public profile page (bio, gallery, reviews, booking CTA, favorite CTA).
  6. `/profile`: Client profile & account details.
  7. `/booking/:barber-slug`: Appointment request form (location type, address, service, preferred schedule).
  8. `/settings` & `/billing`: Client settings and billing placeholder.

### Milestone 5: Provider (Barber) App Experience (`feature/provider-routes`)
- **Git Branch**: `feature/provider-routes`
- **Subtasks**:
  1. `/providers`: Landing page (unauthenticated pitch + login/register links vs authenticated dashboard with appointments overview, feed CTA, analytics).
  2. `/providers/login`: Provider login page.
  3. `/providers/register`: Account creation submitting verification request to admin.
  4. `/providers/status`: Verification status tracker & instructions.
  5. `/providers/profile/private`: Private profile manager (title, short desc, full bio, services menu, gallery, highlighted reviews, auto-confirm toggle, max travel radius).
  6. `/providers/analytics`: Analytics page (profile views, search appearance count, favorite count).
  7. `/providers/settings` & `/providers/billing`: Provider settings and billing page.

### Milestone 6: Admin App Experience & CMS (`feature/admin-routes`)
- **Git Branch**: `feature/admin-routes`
- **Subtasks**:
  1. `/admin`: Admin login (single account, MFA/recovery option), dashboard for provider verification requests (approve/reject), site analytics, user moderation.
  2. `/admin/settings`: Site configuration and relocated "Reset DB" action (`npm run db:reset`).
  3. `/admin/content`: CMS dashboard.
  4. `/admin/content/landing`: Manage landing page content.
  5. `/admin/content/providers-landing`: Manage provider landing page content.

### Milestone 7: E2E Verification & Adversarial Coverage Hardening (`feature/final-e2e-hardening`)
- **Git Branch**: `feature/final-e2e-hardening`
- **Subtasks**:
  1. Execute full E2E test suite against local build (`npm run build` + `npx playwright test`).
  2. Fix any regression bugs or test failures.
  3. Tier 5 Adversarial Testing: Challenge code paths, boundary conditions, and test suite completeness.
  4. Run Forensic Auditor to guarantee code integrity and authentic functionality.

---

## Verification Criteria
- `npm run build` completes with 0 errors.
- `npm test` / `npx playwright test` passes 100% of test cases.
- All branches are created, committed logically, pushed/merged to main according to `TODO.md`.
- Forensic Auditor verdict is CLEAN.
