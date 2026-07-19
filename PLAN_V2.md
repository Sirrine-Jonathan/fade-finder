# PLAN_V2.md — Antigravity Execution Plan for Fade Finder

This document provides a comprehensive analysis of remaining discrepancies from `PLAN.md` and outlines the step-by-step roadmap for implementing **Phase 2 & Next-Gen Navigation** for Fade Finder.

---

## 1. Discrepancy & Gap Analysis (PLAN.md Audit)

| Feature Area | Requirements in PLAN.md | Current Implementation Status | Identified Discrepancy / Gap |
| :--- | :--- | :--- | :--- |
| **Global Navigation** | Responsive top navigation with state awareness | `Navbar.tsx` uses hardcoded/static tabs passed per-page. No dynamic session fetching. | Lacks dynamic auth state awareness (`CLIENT`, `PROVIDER`, `ADMIN`, `LOGGED_OUT`) and mobile drawer/bottom nav. |
| **Mobile UX** | Mobile-first layout, non-cramped navigation | Tabs overflow horizontally (`overflow-x: auto`) on mobile. | Cramped links on screens <640px; needs hamburger drawer and mobile bottom nav. |
| **Client History** | `/history` route for past/upcoming appointments (`PLAN.md` L30) | Missing from `src/app/history`. | Route does not exist; clients cannot view dedicated appointment history. |
| **Forgot Password** | Password reset path on `/login` and `/providers/login` | Login pages link to register, but missing password reset flow. | Missing `/api/auth/forgot-password` endpoint and reset modal/page. |
| **Unit Testing** | Unit tests for UI components and helpers (`PLAN.md` L76) | Playwright E2E tests exist, but no unit test runner or test files. | Missing Vitest / React Testing Library setup and component test suites. |
| **Admin Controls** | Reset DB moved from general nav to Admin Settings | DB reset button is in Admin Settings, but general navbar still has hardcoded admin tabs. | General header needs role gating so admin tools are only visible to authenticated admins. |

---

## 2. Core Roadmap: PLAN_V2 Execution Phases

### Phase 1: Global Auth Context & Dynamic Role-Aware Top Navigation

#### 1.1 Auth Context Provider (`src/components/providers/AuthProvider.tsx`)
- Implement `AuthContext` to expose `user`, `role` (`CLIENT` | `PROVIDER` | `ADMIN` | `GUEST`), `isLoading`, and `logout()`.
- Automatically query `/api/auth/me` on mount to synchronize session cookie state across all pages.

#### 1.2 Dynamic & Mobile-First `Navbar.tsx`
- **Logged Out (`GUEST`)**:
  - *Desktop*: Brand Logo, "Find Barbers" (`/`), "For Barbers" (`/providers`), "Log In" (`/login`), "Sign Up" (`/register` button).
  - *Mobile*: Compact header with logo + Hamburger menu opening a slide-out navigation drawer with distinct Client & Barber sections.
- **Logged In - Consumer (`CLIENT`)**:
  - *Desktop*: Logo, "Find Barbers" (`/search`), "My Appointments" (`/history`), "Profile" (`/profile`), "Settings" (`/settings`), User Avatar + Logout.
  - *Mobile*: Header + Mobile Bottom Navigation Bar (`/` Home, `/search` Search, `/history` Appointments, `/profile` Profile).
- **Logged In - Provider (`PROVIDER`)**:
  - *Desktop*: Logo, "Provider Dashboard" (`/providers`), "Verification Status" (`/providers/status`), "My Barber Profile" (`/providers/profile/private`), "Analytics" (`/providers/analytics`), "Settings" (`/providers/settings`), Logout.
  - *Mobile*: Header + Hamburger Drawer with quick action badges for pending appointments and status.
- **Logged In - Site Admin (`ADMIN`)**:
  - *Desktop*: Logo, "ADMIN" Badge, "Dashboard" (`/admin`), "Site Content" (`/admin/content`), "System Settings & DB" (`/admin/settings`), Logout.
  - *Mobile*: Admin control drawer with quick links to verifications and site landing management.

---

### Phase 2: Missing Routes & Feature Parity

#### 2.1 Consumer Appointment History (`src/app/history/page.tsx`)
- Build `/history` route for consumer account management:
  - Filter appointments by Status: `Upcoming`, `Completed`, `Cancelled`.
  - View details: Barber name, location type (In-Studio vs House Call), address, service price, appointment date/time.
  - Action CTAs: `Cancel Appointment`, `Reschedule`, `Book Again`, `Leave Review`.

#### 2.2 Password Recovery Flow
- Add `/api/auth/forgot-password` route to process password reset requests.
- Add "Forgot Password?" trigger on `/login` and `/providers/login` with an interactive modal / step.

#### 2.3 Provider Status Tracker Enhancements (`src/app/providers/status/page.tsx`)
- Visual progress bar showing provider application steps:
  1. `Account Created`
  2. `DOPL License Submitted`
  3. `Admin Reviewing`
  4. `Approved & Live` (or `Action Required / Rejected`).

---

### Phase 3: Unit Testing Infrastructure

#### 3.1 Test Suite Configuration
- Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` to project devDependencies.
- Create `vitest.config.ts` and `src/test/setup.ts`.

#### 3.2 Component & Logic Unit Tests
- Create unit tests under `src/components/ui/__tests__/`:
  - `Navbar.test.tsx`: Test logged out, client, provider, and admin rendering.
  - `Hero.test.tsx`: Test CTA clicks and prop rendering.
  - `InstallPrompt.test.tsx`: Test dismissable PWA banner behavior.
  - `Button.test.tsx`, `Card.test.tsx`, `Modal.test.tsx`.
- Create unit tests under `src/lib/__tests__/`:
  - `auth.test.ts`: Test `hashPassword`, `verifyPassword`, `createSessionToken`, and `verifySessionToken`.

---

### Phase 4: E2E Integration & Verification

#### 4.1 Playwright E2E Updates (`e2e/`)
- Update `e2e/auth.spec.ts` to test role-aware navigation transitions upon login/logout.
- Update `e2e/consumer.spec.ts` to test mobile hamburger menu and bottom navigation bar interactions on mobile viewports (375x667).
- Update `e2e/natural-lifecycle.spec.ts` to include navigation to `/history` and verify appointment history lifecycle.

---

## 3. Implementation Checklist

- [ ] **Phase 1: Navigation & Auth Context**
  - [ ] Build `AuthProvider` context in `src/components/providers/AuthProvider.tsx`
  - [ ] Refactor `Navbar.tsx` to support mobile drawer, bottom nav bar, and role-aware states (`CLIENT`, `PROVIDER`, `ADMIN`, `GUEST`)
  - [ ] Update `src/app/layout.tsx` to wrap app in `AuthProvider` and include unified `Navbar`
- [ ] **Phase 2: Missing Routes & Features**
  - [ ] Implement `src/app/history/page.tsx` for client appointment history
  - [ ] Build forgot password flow (`/api/auth/forgot-password` and UI modals on login pages)
  - [ ] Polish `/providers/status` verification tracker
- [ ] **Phase 3: Unit Testing Setup**
  - [ ] Install Vitest & Testing Library
  - [ ] Write unit tests for `Navbar`, `Button`, `Hero`, `InstallPrompt`, and `auth.ts`
- [ ] **Phase 4: E2E Testing & Mobile Verification**
  - [ ] Add Playwright tests for mobile hamburger menu and bottom nav
  - [ ] Run full test suite (`npm run test:e2e`) to verify zero regressions
